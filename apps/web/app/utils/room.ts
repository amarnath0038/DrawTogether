import axios from "axios";
import { HTTP_BACKEND } from "../../config";

export async function getActualRoomId(roomSlug: string): Promise<string | null> {
  const token = localStorage.getItem("token");
  if (!token) {
    console.error("No token in localStorage");
    return null;
  }
  console.log("roomslug", roomSlug);
  try {
    const res = await axios.get(`${HTTP_BACKEND}/room/${roomSlug}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const actualRoomId = res.data?.room?.id;
    console.log("Actualroomid: ", actualRoomId);
    return actualRoomId || null;
  } catch (err) {
    console.error("Failed to fetch actual room ID", err);
    return null;
  }
}
