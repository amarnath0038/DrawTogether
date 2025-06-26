import { useRouter } from "next/navigation";
import { Button } from "./ui/button";
import { Users, Zap, Palette } from "lucide-react";

export const Hero = () => {
  const router = useRouter();
  return (
    <section className="relative overflow-hidden py-20 lg:py-32">
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex justify-center mb-6">
            <div className="flex items-center space-x-2 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-full px-4 py-2 border border-gray-200/50 dark:border-gray-700/50">
              <Zap className="w-4 h-4 text-yellow-500" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Real-time collaboration</span>
            </div>
          </div>
          
          <h1 className="text-5xl lg:text-7xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
            Draw, Create,{" "}
            <span className="bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
              Collaborate
            </span>
          </h1>
          
          <p className="text-xl lg:text-2xl text-gray-600 dark:text-gray-300 mb-10 max-w-3xl mx-auto leading-relaxed">
            The infinite canvas where teams bring ideas to life. Draw diagrams, sketch concepts, 
            and brainstorm together in real-time from anywhere in the world.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <Button 
              size="lg" 
              onClick={() => router.push("/dashboard")}
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-8 py-4 text-lg shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
            >
              Start Drawing
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              onClick={() => router.push("/dashboard")}
              className="px-8 py-4 text-lg border-2 hover:bg-gray-50 dark:hover:bg-gray-800 dark:border-gray-600 dark:text-gray-300 transition-all duration-300"
            >
              Watch Demo
            </Button> 
          </div>
          
          {/* Random numbers */}
          <div className="flex items-center justify-center space-x-8 text-gray-500 dark:text-gray-400">
            <div className="flex items-center space-x-2">
              <Users className="w-5 h-5" />
              <span>10M+ collaborators</span>
            </div>
            <div className="flex items-center space-x-2">
              <Palette className="w-5 h-5" />
              <span>50M+ drawings</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Preview (video add karni chahiye idar */}
      <div className="container mx-auto px-4 mt-16">
        <div className="max-w-5xl mx-auto">
          <div className="relative">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 overflow-hidden">
              <div className="bg-gray-50 dark:bg-gray-700 px-6 py-4 border-b border-gray-200/50 dark:border-gray-600/50">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                  <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                  <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                </div>
              </div>
              <div className="aspect-video bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-900 flex items-center justify-center">
                <div className="text-center space-y-4">
                  <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mx-auto flex items-center justify-center transform rotate-12 hover:rotate-6 transition-transform duration-300">
                    <Palette className="w-12 h-12 text-white" />
                  </div>
                  <p className="text-gray-600 dark:text-gray-300 text-lg">Interactive Canvas Preview</p>
                </div>
              </div>
            </div>
            <div className="absolute -top-4 -right-4 w-8 h-8 bg-green-400 rounded-full animate-pulse"></div>
            <div className="absolute -bottom-4 -left-4 w-6 h-6 bg-blue-400 rounded-full animate-pulse delay-500"></div>
          </div>
        </div>
      </div>
    </section>
  );
};