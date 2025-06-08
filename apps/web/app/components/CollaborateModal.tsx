"use client";

import { useEffect } from "react";
import { Copy } from "lucide-react"; 

export function CollaborateModal({
  roomId,
  onClose,
}: {
  roomId: string;
  onClose: () => void;
}) {
  const roomLink = `${window.location.origin}/room/${roomId}`;

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  const copy = async (text: string) => {
    await navigator.clipboard.writeText(text);
    alert("Copied to clipboard");
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-gray-800 rounded-2xl w-full max-w-md p-8 shadow-2xl border border-gray-700/50">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">
            Collaborate in real time
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-all"
          >
            ✕
          </button>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Room ID
            </label>
            <div className="flex items-center justify-between bg-gray-700 border border-gray-600 rounded-lg px-4 py-2">
              <span className="text-white break-all">
                {roomId}
              </span>
              <button
                onClick={() => copy(roomId)}
                className="text-blue-400 hover:text-blue-300 transition-all p-1"
                title="Copy Room ID"
              >
                <Copy className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Sharable Link
            </label>
            <div className="flex items-center justify-between bg-gray-700 border border-gray-600 rounded-lg px-4 py-2">
              <span className="text-white truncate max-w-[70%]">
                {roomLink}
              </span>
              <button
                onClick={() => copy(roomLink)}
                className="text-blue-400 hover:text-blue-300 transition-all p-1"
                title="Copy Link"
              >
                <Copy className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

