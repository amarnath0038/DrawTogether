import { WebSocketServer, WebSocket } from "ws";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "@repo/backend-common/config";
import { prismaClient } from "@repo/db/client";


const wss = new WebSocketServer({ port: 8080 });
console.log("WebSocket server running at ws://localhost:8080");


interface User {
  ws: WebSocket;
  rooms: string[];
  userId: string;
}

const users: User[] = [];

// Auth check 
function checkUser(token: string): string | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (typeof decoded !== "object" || decoded === null || !("id" in decoded)) {
      return null;
    }
    return (decoded as { id: string }).id;
  } catch (err) {
    console.error("JWT verification failed:", err);
    return null;
  }
}


wss.on("connection", (ws: WebSocket, request) => {
  const url = request.url;
  console.log("Incoming connection URL:", url);

  if (!url) {
    ws.close();
    return;
  }

  const queryParams = new URLSearchParams(url.split("?")[1]);
  const token = queryParams.get("token") || "";
  console.log("Token from URL:", token);

  const userId = checkUser(token);
  console.log("Decoded user:", userId);

  if (!userId) {
    ws.close();
    return;
  }

  const user: User = {
    ws,
    rooms: [],
    userId
  };
  users.push(user);

  ws.on("message", async (data) => {
    let parsedData;

    try {
      parsedData = JSON.parse(data.toString());
    } catch (err) {
      console.error("Invalid JSON ", err);
      ws.send(JSON.stringify({ type: "error", message: "Invalid JSON format" }));
      return;
    }

    switch (parsedData.type) {
      case "join_room":
        if (typeof parsedData.roomId !== "string") {
          ws.send(JSON.stringify({ type: "error", message: "Invalid room ID" }));
          return;
        }
        user.rooms.push(parsedData.roomId);
        break;

      case "leave_room":
        if (typeof parsedData.roomId !== "string") {
          ws.send(JSON.stringify({ type: "error", message: "Invalid room ID" }));
          return;
        }
        user.rooms = user.rooms.filter(room => room !== parsedData.roomId);
        break;

      case "chat":
        {
          const { roomId, message } = parsedData;
          if (typeof roomId !== "string" || typeof message !== "string") {
            ws.send(JSON.stringify({ type: "error", message: "Invalid message format" }));
            return;
          }

          try {
            await prismaClient.chat.create({
              data: {
                roomId: Number(roomId),
                message,
                userId: user.userId
              }
            });

            users.forEach(u => {
              if (u.rooms.includes(roomId)) {
                u.ws.send(JSON.stringify({
                  type: "chat",
                  roomId,
                  message
                }));
              }
            });
          } catch (err) {
            console.error("Database error:", err);
            ws.send(JSON.stringify({ type: "error", message: "Failed to save message" }));
          }
        }
        break;

      default:
        ws.send(JSON.stringify({ type: "error", message: "Message type is unknown" }));
    }
  });

  ws.on("close", () => {
    const index = users.findIndex(u => u.ws === ws);
    if (index !== -1) {
      users.splice(index, 1);
    }
  });
});
