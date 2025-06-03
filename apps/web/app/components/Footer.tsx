import { Palette, Github, Mail } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="bg-gray-900 dark:bg-black text-white py-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-6">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Palette className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold">DrawTogether</span>
            </div>
            <p className="text-gray-400 dark:text-gray-500 max-w-md leading-relaxed mb-6">
              The collaborative drawing platform that brings teams together. 
              Create, share, and iterate on ideas in real-time.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="w-10 h-10 bg-gray-800 dark:bg-gray-900 rounded-lg flex items-center justify-center hover:bg-gray-700 dark:hover:bg-gray-800 transition-colors">
                <img src="x.svg" className="w-5 h-5 invert" />
              </a>
              <a href="#" className="w-10 h-10 bg-gray-800 dark:bg-gray-900 rounded-lg flex items-center justify-center hover:bg-gray-700 dark:hover:bg-gray-800 transition-colors">
                <Github className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-gray-800 dark:bg-gray-900 rounded-lg flex items-center justify-center hover:bg-gray-700 dark:hover:bg-gray-800 transition-colors">
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4">Product</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-400 dark:text-gray-500 hover:text-white transition-colors">Features</a></li>
              <li><a href="#" className="text-gray-400 dark:text-gray-500 hover:text-white transition-colors">Pricing</a></li>
              <li><a href="#" className="text-gray-400 dark:text-gray-500 hover:text-white transition-colors">Integrations</a></li>
              <li><a href="#" className="text-gray-400 dark:text-gray-500 hover:text-white transition-colors">API</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4">Company</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-400 dark:text-gray-500 hover:text-white transition-colors">About</a></li>
              <li><a href="#" className="text-gray-400 dark:text-gray-500 hover:text-white transition-colors">Blog</a></li>
              <li><a href="#" className="text-gray-400 dark:text-gray-500 hover:text-white transition-colors">Careers</a></li>
              <li><a href="#" className="text-gray-400 dark:text-gray-500 hover:text-white transition-colors">Contact</a></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-800 dark:border-gray-900 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 dark:text-gray-500 text-sm">
              © 2025 DrawTogether. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#" className="text-gray-400 dark:text-gray-500 hover:text-white text-sm transition-colors">Privacy Policy</a>
              <a href="#" className="text-gray-400 dark:text-gray-500 hover:text-white text-sm transition-colors">Terms of Service</a>
              <a href="#" className="text-gray-400 dark:text-gray-500 hover:text-white text-sm transition-colors">Support</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};