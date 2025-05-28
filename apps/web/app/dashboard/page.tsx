"use client";

import axios from "axios";
import { useRouter } from "next/navigation";
import { useState } from "react";

function slugify(text: string) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-");
}

export default function Dashboard() {
  const router = useRouter();
  const [roomName, setRoomName] = useState("");
  const [joinRoomCode, setJoinRoomCode] = useState("");
  const [modalType, setModalType] = useState<"create" | "join" | null>(null);
  const [creating, setCreating] = useState(false);

  async function handleCreateRoom(e: React.FormEvent) {
    e.preventDefault();
    if (!roomName.trim()) {
      alert("Please enter a room name");
      return;
    }
    const slug = slugify(roomName);
    try {
      const token = localStorage.getItem("token");
      setCreating(true);
      const res = await axios.post("http://localhost:3001/create-room",
        {slug},
        {headers: {Authorization: `Bearer ${token}`}}
      );
      setRoomName("");
      setModalType(null);
      router.push(`/room/${slug}`);
    } catch (err) {
      console.log("Create room error: ", err);
      alert("Error while creating room");
    } finally {
      setCreating(false);
    }
  }

  function handleJoinRoom() {
    if (!joinRoomCode.trim()) {
      alert("Please enter room code");
      return;
    }
    setModalType(null);
    router.push(`/room/${joinRoomCode.trim()}`);
  }

  return (
    <div
      className="min-h-screen w-screen px-4 py-6"
      style={{
        backgroundImage: `url('/Bg1.jpeg')`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}>
      <div className="max-w-7xl mx-auto bg-black backdrop-blur-md p-6 rounded-xl shadow-lg text-white">
        <h1 className="text-3xl font-bold mb-6 text-center">Welcome to Your Creative Space</h1>

        {/* Create and join room boxes */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-10">
          <div
            className="bg-gray-900/80 h-60 flex flex-col justify-center items-center rounded-lg shadow cursor-pointer hover:scale-105 transition-transform"
            onClick={() => setModalType("create")}
          >
            <button className="bg-indigo-800 px-4 py-2 rounded hover:bg-gray-200 hover:text-black font-semibold">
              + Create Room
            </button>
          </div>

          <div
            className="bg-gray-900/80 h-60 flex flex-col justify-center items-center rounded-lg shadow cursor-pointer hover:scale-105 transition-transform"
            onClick={() => setModalType("join")}
          >
            <button className="bg-indigo-800 px-4 py-2 rounded hover:bg-gray-200 hover:text-black font-semibold">
              🔑 Join Room
            </button>
          </div>
        </div>


        {/* Recently created rooms */}
        <h2 className="text-2xl font-semibold mb-4">Recent Rooms</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <div className="bg-gray-900/80 p-4 rounded-lg shadow hover:scale-105 transition-transform cursor-pointer">
            <h3 className="text-xl font-semibold">Bank Heist</h3>
            <p className="text-sm text-gray-400 mt-2">Last active: 1h ago</p>
          </div>
          <div className="bg-gray-900/80 p-4 rounded-lg shadow hover:scale-105 transition-transform cursor-pointer">
            <h3 className="text-xl font-semibold">Pizza making</h3>
            <p className="text-sm text-gray-400 mt-2">Last active: 2h ago</p>
          </div>
          <div className="bg-gray-900/80 p-4 rounded-lg shadow hover:scale-105 transition-transform cursor-pointer">
            <h3 className="text-xl font-semibold">Gajab Plan</h3>
            <p className="text-sm text-gray-400 mt-2">Last active: 30m ago</p>
          </div>
        </div>
      </div>

      {/* modal for create and join room*/}
      {modalType && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center">
          <div className="bg-gray-900 p-6 rounded-lg w-full max-w-md relative">
            <h2 className="text-2xl text-white font-bold mb-4">
              {modalType === "create" ? "Create a Room" : "Join a Room"}
            </h2>
            <form
              onSubmit={
                modalType === "create" ? handleCreateRoom : (e) => {
                  e.preventDefault();
                  handleJoinRoom();
                    }
              }
              className="space-y-4"
            >
              <input
                type="text"
                placeholder={
                  modalType === "create" ? "Enter room name" : "Enter room code"
                }
                value={modalType === "create" ? roomName : joinRoomCode}
                onChange={(e) =>
                  modalType === "create" ? setRoomName(e.target.value) : setJoinRoomCode(e.target.value)
                }
                className="w-full p-3 rounded bg-gray-800 text-white border border-gray-700"
              />
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setModalType(null)} className="px-4 py-2 w-25 rounded bg-gray-200 hover:bg-white text-black font-semibold">
                  Cancel
                </button>
                <button type="submit" disabled={creating && modalType === "create"} className="px-4 py-2 w-25 rounded bg-indigo-600 text-white hover:bg-indigo-500 font-semibold">
                  {modalType === "create" ? creating ? "Creating..." : "Create" : "Join"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
