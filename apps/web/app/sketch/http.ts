
import { HTTP_BACKEND } from "../../config";
import axios from "axios";

export async function getExistingShapes(roomId: string) {
  const token = localStorage.getItem("token");
  if (!token) {
    console.error("No token found in localStorage");
    return [];
  }
  try {
    const chatRes = await axios.get(`${HTTP_BACKEND}/chats/${roomId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const messages = chatRes.data?.chat || [];

    const shapes = messages.map((msg: string) => {
      try {
        return JSON.parse(msg).shape;
      } catch (err) {
        console.warn("Invalid shape format:", msg);
        return null;
      }
    }).filter(Boolean);

    return shapes;
  } catch (err) {
    console.error("Failed to get existing shapes:", err);
    return [];
  }
}
