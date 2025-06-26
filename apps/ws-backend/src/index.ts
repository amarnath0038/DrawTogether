import { WebSocketServer, WebSocket } from "ws";
import jwt from "jsonwebtoken";
import { JWT_SECRET, WS_PORT } from "@repo/backend-common/config";
import { prismaClient } from "@repo/db/client";


const wss = new WebSocketServer({ port: WS_PORT });
console.log(`WebSocket server running at ws://localhost:${WS_PORT}`);
 
type Shape = any;

interface RoomState {
  shapes: Shape[];
  undoneShapes: Shape[];
}

const roomStates: Map<string, RoomState> = new Map();


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
  //console.log("Incoming connection URL:", url);

  if (!url) {
    ws.close();
    return;
  }

  const queryParams = new URLSearchParams(url.split("?")[1]);
  const token = queryParams.get("token") || "";
  //console.log("Token from URL:", token);

  const userId = checkUser(token);
  //console.log("Decoded user:", userId);

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
        {
          // if (typeof parsedData.roomId !== "string") {
          //   ws.send(JSON.stringify({ type: "error", message: "Invalid room ID" }));
          //   return;
          // }
          const RoomId = String(parsedData.roomId)
          user.rooms.push(RoomId);

          // if (!roomStates.has(RoomId)) {
          //   roomStates.set(RoomId, {shapes: [], undoneShapes: []});
          // }

          if (!roomStates.has(RoomId)) {
            const dbRoom = await prismaClient.room.findUnique({
              where: {
                id: RoomId
              }
            });

            roomStates.set(RoomId, {
            shapes: Array.isArray(dbRoom?.shapes) ? dbRoom.shapes : [],
            undoneShapes: Array.isArray(dbRoom?.undoneShapes) ? dbRoom.undoneShapes : [],
          });
          }
          //Send curr shapes 2 user
          const currentRoom = roomStates.get(RoomId);
          ws.send(JSON.stringify({type: "sync", roomId: RoomId, shapes: currentRoom?.shapes || []}));
          console.log("User joined room", RoomId, "Sending shapes:", currentRoom?.shapes?.length);

        }
        break;

      case "leave_room":
        {
        const RoomId = String(parsedData.roomId)
        user.rooms = user.rooms.filter(room => room !== RoomId);
        }
        break;

      case "chat":
        const { roomId, message } = parsedData;
        const RoomId = String(roomId);

        try {
          const parsed = JSON.parse(message); // message = '{"shape": {...}}'
          if (!parsed?.shape) {
            throw new Error("Invalid shape format");
          }

          const shape = parsed.shape;
          const room = roomStates.get(RoomId) ?? { shapes: [], undoneShapes: [] };

          room.shapes.push(shape);
          room.undoneShapes = []; // reset redo stack
          roomStates.set(RoomId, room);

          // await prismaClient.chat.create({
          //   data: {
          //     roomId: RoomId,
          //     message: JSON.stringify({shape}), // store stringified shape
          //     userId: user.userId
          //   }
          // });

          //updating shapes and undo  stack persistently
          await prismaClient.room.upsert({
            where: { id: RoomId },
            update: {
              shapes: room.shapes,
              undoneShapes: room.undoneShapes,
            },
            create: {
              id: RoomId,
              slug: RoomId,
              adminId: user.userId,
              shapes: room.shapes,
              undoneShapes: room.undoneShapes,
            },
          })


          users.forEach(u => {
            if (u.rooms.includes(RoomId)) {
              u.ws.send(JSON.stringify({type: "sync", roomId: RoomId, shapes: room.shapes}));
            }
          });
        } catch (err) {
          console.error("Invalid shape format or db error:", err);
          ws.send(JSON.stringify({ type: "error", message: "Invalid shape format" }));
        }
        break;
      
      case "undo":
        {
          const RoomId = String(parsedData.roomId);
          const room = roomStates.get(RoomId);
          if (!room || room.shapes.length === 0) return;

          const shape = room.shapes.pop();
          if (shape) {
            room.undoneShapes.push(shape);
          }
          // remove last saved shape from db
          // try {
          //   await prismaClient.chat.deleteMany({
          //     where: {
          //       roomId: RoomId,
          //       message: JSON.stringify({shape})
          //     }
          //   })
          // } catch(err) {
          //   console.error("Failed to remove shape from db on undo: ", err);
          // }

          await prismaClient.room.update({
            where: { id: RoomId },
            data: {
              shapes: room.shapes,
              undoneShapes: room.undoneShapes,
            },
          });

          users.forEach(u => {
            if (u.rooms.includes(RoomId)) {
              u.ws.send(JSON.stringify({
                type: "sync",
                roomId: RoomId,
                shapes: room.shapes
              }));
            }
          });
        //testing
        const saved = await prismaClient.room.findUnique({ where: { id: RoomId } });
        console.log("After UNDO:", saved?.shapes, saved?.undoneShapes);
        }
        break;

      case "redo":
        {
          const RoomId = String(parsedData.roomId);
          const room = roomStates.get(RoomId);
          if (!room || room.undoneShapes.length === 0) return;

          const shape = room.undoneShapes.pop();
          if (shape){
            room.shapes.push(shape);
          } 

          // Resave shape to db
          await prismaClient.room.update({
            where: { id: RoomId },
            data: {
              shapes: room.shapes,
              undoneShapes: room.undoneShapes,
            },
          });

          users.forEach(u => {
            if (u.rooms.includes(RoomId)) {
              u.ws.send(JSON.stringify({
                type: "sync",
                roomId: RoomId,
                shapes: room.shapes
              }));
            }
          });
        }
        break;

      case "clear": 
        {
          const RoomId = String(parsedData.roomId);
          const room = roomStates.get(RoomId);

          if (room) {
            room.shapes = [];
            room.undoneShapes = [];
          }
          // Permanently delete from db
          try {
            await prismaClient.chat.deleteMany({
              where: {
                roomId: RoomId
              }
            });
          } catch (err) {
            console.error("Failed to delete shapes from DB:", err);
            // ws.send(JSON.stringify({
            //   type: "error",
            //   message: "Failed to reset shapes from database."
            // }));
            // return;
          }

          await prismaClient.room.update({
            where: { id: RoomId },
            data: {
              shapes: [],
              undoneShapes: [],
            },
          });
          // Broadcast the cleared state
          users.forEach(u => {
            if (u.rooms.includes(RoomId)) {
              u.ws.send(JSON.stringify({
                type: "sync",
                roomId: RoomId,
                shapes: []
              }));
            }
          });
        }
        break;

      case "delete_shape": {
        const RoomId = String(parsedData.roomId);
        const index = parsedData.index;
        const room = roomStates.get(RoomId);

        if (!room || typeof index !== "number" || index < 0 || index >= room.shapes.length) return;

        // Remove the shape
        room.shapes.splice(index, 1);
        roomStates.set(RoomId, room);

        // Persist new shape list
        await prismaClient.room.update({
          where: { id: RoomId },
          data: {
            shapes: room.shapes,
            undoneShapes: room.undoneShapes
          },
        });

        // Broadcast updated shapes to all users
        users.forEach((u) => {
          if (u.rooms.includes(RoomId)) {
            u.ws.send(JSON.stringify({
              type: "sync",
              roomId: RoomId,
              shapes: room.shapes,
            }));
          }
        });

        break;
      }

      
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
