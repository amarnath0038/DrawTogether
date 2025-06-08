"use client";

import axios from "axios";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useTheme } from ".././hooks/useTheme";
import { Plus, Key, Clock, Palette, Moon, Sun, LogOut } from "lucide-react";


export default function Dashboard() {
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
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

    try {
      const token = localStorage.getItem("token");
      setCreating(true);
      const res = await axios.post("http://localhost:3001/create-room",
        {name: roomName},
        {headers: {Authorization: `Bearer ${token}`}}
      );
      const actualRoomId = res.data.room.id;
      if (!actualRoomId) {
        alert("Failed to get roomId");
        return;
      }
      setRoomName("");
      setModalType(null);
      router.push(`/room/${actualRoomId}`);
    } catch (err) {
      console.log("Create room error: ", err);
      alert("Error while creating room");
    } finally {
      setCreating(false);
    }
  }

  function handleJoinRoom(e: React.FormEvent) {
    e.preventDefault();
    if (!joinRoomCode.trim()) {
      alert("Please enter room code");
      return;
    }
    setModalType(null);
    router.push(`/room/${joinRoomCode.trim()}`);
  }

  function handleLogout() {
    localStorage.removeItem("token");
    router.push("/");
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200/50 dark:border-gray-700/50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Palette className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900 dark:text-white">DrawTogether</span>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={toggleTheme}
                className="w-9 h-9 flex items-center justify-center rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                {theme === 'dark' ? (<Sun className="h-4 w-4 text-gray-600 dark:text-gray-300" />) : (<Moon className="h-4 w-4 text-gray-600 dark:text-gray-300" />)}
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors">
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2 text-center">Welcome to Your Creative Space</h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-12 text-center">Create new rooms or join existing ones to start collaborating</p>

          {/* Create and join room boxes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
            <div
              className="group bg-white dark:bg-gray-800 rounded-2xl border border-gray-200/50 dark:border-gray-700/50 hover:border-gray-300/50 dark:hover:border-gray-600/50 shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer p-8"
              onClick={() => setModalType("create")}
            >
              <div className="flex flex-col items-center justify-center h-48">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Plus className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Create Room</h3>
                <p className="text-gray-600 dark:text-gray-300 text-center">Start a new collaborative drawing session</p>
              </div>
            </div>

            <div
              className="group bg-white dark:bg-gray-800 rounded-2xl border border-gray-200/50 dark:border-gray-700/50 hover:border-gray-300/50 dark:hover:border-gray-600/50 shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer p-8"
              onClick={() => setModalType("join")}
            >
              <div className="flex flex-col items-center justify-center h-48">
                <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Key className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Join Room</h3>
                <p className="text-gray-600 dark:text-gray-300 text-center">Enter a room code to join an existing session</p>
              </div>
            </div>
          </div>

          {/* Recent rooms */}
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">Recent Rooms</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200/50 dark:border-gray-700/50 hover:border-gray-300/50 dark:hover:border-gray-600/50 shadow-sm hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 cursor-pointer p-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Bank Heist</h3>
                <div className="flex items-center text-gray-500 dark:text-gray-400 text-sm">
                  <Clock className="w-4 h-4 mr-2" />
                  <span>Last active: 1h ago</span>
                </div>
              </div>
              
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200/50 dark:border-gray-700/50 hover:border-gray-300/50 dark:hover:border-gray-600/50 shadow-sm hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 cursor-pointer p-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Pizza Making</h3>
                <div className="flex items-center text-gray-500 dark:text-gray-400 text-sm">
                  <Clock className="w-4 h-4 mr-2" />
                  <span>Last active: 2h ago</span>
                </div>
              </div>
              
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200/50 dark:border-gray-700/50 hover:border-gray-300/50 dark:hover:border-gray-600/50 shadow-sm hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 cursor-pointer p-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Gajab Plan</h3>
                <div className="flex items-center text-gray-500 dark:text-gray-400 text-sm">
                  <Clock className="w-4 h-4 mr-2" />
                  <span>Last active: 30m ago</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal for create and join room */}
      {modalType && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md p-8 shadow-2xl border border-gray-200/50 dark:border-gray-700/50">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              {modalType === "create" ? "Create a Room" : "Join a Room"}
            </h2>
            <form
              onSubmit={modalType === "create" ? handleCreateRoom : handleJoinRoom}
              className="space-y-6"
              >
              <div>
                <input
                  type="text"
                  placeholder={modalType === "create" ? "Enter room name" : "Enter room code"}
                  value={modalType === "create" ? roomName : joinRoomCode}
                  onChange={(e) => modalType === "create" ? setRoomName(e.target.value) : setJoinRoomCode(e.target.value)}
                  className="w-full p-4 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  required
                />
              </div>
              <div className="flex justify-end gap-4">
                <button 
                  type="button" 
                  onClick={() => setModalType(null)} 
                  className="px-6 py-3 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={creating && modalType === "create"} 
                  className="px-6 py-3 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed">
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



