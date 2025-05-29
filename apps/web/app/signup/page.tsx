"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Mail, Lock, Eye, EyeOff, Palette, Moon, Sun } from "lucide-react";
import { useTheme } from ".././hooks/useTheme";
import axios from "axios";

export default function Signup() {
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  async function signupHandler(e: React.FormEvent) {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:3001/signup", {name, email, password});
      router.push("/signin");
    } catch (err: any) {
      console.error("Signup error", err);
      alert("Signup failed");
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center px-4">
      <div className="absolute top-0 left-0 right-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Palette className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900 dark:text-white">DrawTogether</span>
          </div>
          <button
            onClick={toggleTheme}
            className="w-9 h-9 flex items-center justify-center rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            {theme === 'dark' ? (<Sun className="h-4 w-4 text-gray-600 dark:text-gray-300" />) : (<Moon className="h-4 w-4 text-gray-600 dark:text-gray-300" />)}
          </button>
        </div>
      </div>

      <div className="w-full max-w-md bg-white/80 dark:bg-gray-800/80 backdrop-blur-md p-8 rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6 text-center">Create your account</h2>
        <form className="space-y-6" onSubmit={signupHandler}>
          <div>
            <input 
              type="text" 
              placeholder="Full Name" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              className="w-full p-4 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" 
              required
            />
          </div>
          
          <div className="relative">
            <input 
              type="email" 
              placeholder="Email address" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              className="w-full p-4 pl-12 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              required
            />
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" size={20} />
          </div>
          
          <div className="relative">
            <input 
              type={showPassword ? "text" : "password"}
              placeholder="Password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              className="w-full p-4 pl-12 pr-12 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              required
            />
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" size={20} />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)} 
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-blue-500 transition-colors">
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
          
          <button 
            type="submit" 
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white py-4 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]">
            Create Account
          </button>
        </form>

        <div className="flex items-center my-6">
          <hr className="flex-grow border-t border-gray-300 dark:border-gray-600" />
          <span className="px-4 text-gray-500 dark:text-gray-400 text-sm">Or continue with</span>
          <hr className="flex-grow border-t border-gray-300 dark:border-gray-600" />
        </div>

        <div className="space-y-3">
          <button
            type="button"
            onClick={() => window.location.href = "http://localhost:3001/auth/google"}
            className="w-full flex items-center justify-center py-3 rounded-lg bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-600 transition-all duration-200 shadow-sm">
            <img src="/google-logo.svg" alt="Google" className="w-5 h-5 mr-3" />
            Continue with Google
          </button>
          
          <button
            type="button"
            onClick={() => window.location.href = "http://localhost:3001/auth/github"}
            className="w-full flex items-center justify-center py-3 rounded-lg bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-600 transition-all duration-200 shadow-sm">
            <img src="/github-logo.svg" alt="Github" className="w-5 h-5 mr-3" />
            Continue with Github
          </button>
        </div>

        <p className="text-gray-600 dark:text-gray-400 text-center mt-6">
          Already have an account?{" "}
          <button 
            onClick={() => router.push("/signin")} 
            className="text-blue-600 dark:text-blue-400 font-medium hover:underline">
            Sign in
          </button>
        </p>
      </div>
    </div>
  );
}
