"use client";

import { WS_BACKEND } from "../../config";
import { useEffect, useState } from "react";
import { Canvas } from "./Canvas";
import { CollaborateModal } from "./CollaborateModal";

export function RoomCanvas({ roomId }: { roomId: string }) {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [showCollaborateModal, setShowCollaborateModal] = useState(false);

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
        ws = new WebSocket(`${WS_BACKEND}?token=${token}`);

        ws.onopen = () => {
          setSocket(ws);
          const data = JSON.stringify({
            type: "join_room",
            roomId: roomId,
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
    return (
      <div className="flex items-center justify-center h-screen bg-black text-white">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
          <p className="text-lg">Connecting to server</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Canvas roomId={roomId} socket={socket} onCollaborate={() => setShowCollaborateModal(true)} />
      {showCollaborateModal && (
        <CollaborateModal roomId={roomId} onClose={() => setShowCollaborateModal(false)} />
      )}

    </>
  )
}

