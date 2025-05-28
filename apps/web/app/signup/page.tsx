"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import axios from "axios";

export default function Signup() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  async function signupHandler(e: React.FormEvent) {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:3001/signup", {
        name,
        email,
        password
      });
      router.push("/signin");
    } catch (err: any) {
      console.error("Signup error", err);
      alert("Signup failed");
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
        <h2 className="text-3xl font-bold text-white mb-6 text-center">Create your account</h2>
        <form className="space-y-4" onSubmit={signupHandler}>
          <input 
            type="text" 
            placeholder="Name" 
            value={name} 
            onChange={(e) => setName(e.target.value)} 
            className="w-full p-3 rounded-md bg-gray-800 text-white border border-gray-600" />
          <div className="relative">
            <input 
              type="email" 
              placeholder="Email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              className="w-full p-3 pl-10 rounded-md bg-gray-800 text-white border border-gray-600" />
            <Mail className= "absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 border-gray-600" size={20} />
          </div>
          <div className="relative">
            <input 
              type={showPassword ? "text" : "password"}
              placeholder="Password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              className="w-full p-3 pl-10 rounded-md bg-gray-800 text-white border border-gray-600" 
            />
            <Lock className= "absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 border-gray-600" size={20} />
            <button
              type="button"
              onClick={() => setShowPassword((x) => !x)} 
              className="absolute right-3 pr-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-indigo-400"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
          <button type="submit" className="w-full bg-indigo-800 text-white py-3 rounded-md transition-all duration-200 hover:bg-indigo-600 hover:brightness-110">
            Sign Up
          </button>
        </form>

        <div className="flex items-center my-6">
          <hr className="flex-grow border-t border-gray-500" />
          <span className="px-3 text-white text-sm">OR</span>
          <hr className="flex-grow border-t border-gray-500" />
        </div>

        <div className="flex flex-col space-y-2 mt-4">
          <button
            type="button"
            onClick={() => window.location.href = "http://localhost:3001/auth/google"}
            className="w-full mb-4 flex items-center justify-center py-3 rounded-md bg-gray-200 text-black font-semibold transition-all duration-200 hover:bg-indigo-600 hover:text-white">
            <img src="/google-logo.svg" alt="Google" className="w-5 h-5 mr-2" />
            Continue with Google
          </button>
          <button
            type="button"
            onClick={() => window.location.href = "http://localhost:3001/auth/github"}
            className="w-full flex items-center justify-center py-3 rounded-md bg-gray-200 text-black font-semibold transition all duration-200 hover:bg-indigo-600 hover:text-white">
            <img src="/github-logo.svg" alt="Google" className="w-5 h-5 mr-2" />
            Continue with Github
          </button>
        </div>

        <p className="text-white text-center mt-4">
          Already have an account?{" "}
          <span onClick={() => router.push("/signin")} className="text-indigo-400 underline cursor-pointer">Sign in</span>
        </p>
      </div>
    </div>
  );
}
