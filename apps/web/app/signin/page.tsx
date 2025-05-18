"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import axios from "axios";

export default function Signin() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  
  async function signinHandler(e: React.FormEvent) {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:3001/signin", {
        email,
        password
      });
      localStorage.setItem("token", res.data.token);
      router.push("/dashboard");
    } catch (err: any) {
      console.error("Signin error", err);
      alert("Signin failed");
    }
  }

  return (
    <div className="min-h-screen w-screen flex items-center justify-center px-4"
      style={{
        backgroundImage: `url('/Bg1.jpeg')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}>
      <div className="w-full max-w-md bg-black/60 backdrop-blur-md p-8 rounded-xl shadow-lg">
        <h2 className="text-3xl font-bold text-white mb-6 text-center">Welcome back</h2>
        <form className="space-y-4" onSubmit={signinHandler}>
          <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full p-3 rounded-md bg-gray-800 text-white border border-gray-600" />
          <div className="relative">
            <input 
              type={showPassword ? "text" : "password"}
              placeholder="Password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              className="w-full p-3 rounded-md bg-gray-800 text-white border border-gray-600" 
            />
            <button
              type="button"
              onClick={() => setShowPassword((x) => !x)} 
              className="absolute right-3 pr-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-indigo-400"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
          <button type="submit" className="w-full bg-indigo-800 text-white py-3 rounded-md hover:bg-gray-200 hover:text-black hover:font-semibold">
            Sign In
          </button>
        </form>
        <p className="text-white text-center mt-4">
          Don't have an account?{" "}
          <span onClick={() => router.push("/signup")} className="text-indigo-400 underline cursor-pointer">Sign up</span>
        </p>
      </div>
    </div>
  );
}
