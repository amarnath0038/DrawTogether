"use client";

import { WS_BACKEND } from "../../config";
import { useEffect, useState } from "react";
import { Canvas } from "./Canvas";
import { getActualRoomId } from "../utils/room";

export function RoomCanvas({ roomId }: { roomId: string }) {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [token, setToken] = useState<string | null>(null);

  // Get token after hydration
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedToken = localStorage.getItem("token");
      if (!storedToken) {
        console.error("No token found in localStorage");
        return;
      }
      setToken(storedToken);
    }
  }, []);

  
    useEffect(() => {
      if (!token || !roomId) return;

      let ws: WebSocket;

      (async () => {
        const actualRoomId = await getActualRoomId(roomId); // here roomId is slug
        if (!actualRoomId) {
          console.error("No actualRoomId found for slug", roomId);
          return;
        }

        ws = new WebSocket(`${WS_BACKEND}?token=${token}`);

        ws.onopen = () => {
          setSocket(ws);
          const data = JSON.stringify({
            type: "join_room",
            roomId: actualRoomId.toString(),
          });
          console.log("Joining room with:", data);
          ws.send(data);
        };

        ws.onerror = (err) => {
          console.error("WebSocket error:", err);
        };
      })();

      return () => {
        if (ws) ws.close();
      };
    }, [token, roomId]);

  if (!socket) {
    return <div>Connecting to server....</div>;
  }

  return <Canvas roomId={roomId} socket={socket} />;
}

