import { Users, Zap, Cloud, Lock, Smartphone, Download } from "lucide-react";

const features = [
  {
    icon: Users,
    title: "Real-time Collaboration",
    description: "Work together with your team in real-time. See changes instantly as others draw and edit.",
    color: "from-blue-500 to-blue-600"
  },
  {
    icon: Zap,
    title: "Lightning Fast",
    description: "Smooth performance with no lag. Your ideas flow as fast as you can think them.",
    color: "from-yellow-500 to-orange-500"
  },
  {
    icon: Cloud,
    title: "Cloud Sync",
    description: "Your drawings are automatically saved and synced across all your devices.",
    color: "from-purple-500 to-purple-600"
  },
  {
    icon: Lock,
    title: "Private & Secure",
    description: "End-to-end encryption ensures your ideas and designs stay private and secure.",
    color: "from-green-500 to-green-600"
  },
  {
    icon: Smartphone,
    title: "Cross-Platform",
    description: "Works seamlessly on desktop, tablet, and mobile. Draw anywhere, anytime.",
    color: "from-pink-500 to-rose-500"
  },
  {
    icon: Download,
    title: "Export Everything",
    description: "Export your creations in multiple formats: PNG, SVG, PDF, and more.",
    color: "from-indigo-500 to-indigo-600"
  }
];

export const Features = () => {
  return (
    <section id="features" className="py-20 lg:py-32 bg-white dark:bg-gray-900">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-6">
            Everything you need to{" "}
            <span className="bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
              create together
            </span>
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Powerful features designed for modern teams who need to visualize, 
            collaborate, and iterate quickly on their ideas.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div 
                key={index}
                className="group p-8 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200/50 dark:border-gray-700/50 hover:border-gray-300/50 dark:hover:border-gray-600/50 shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2"
              >
                <div className={`w-12 h-12 bg-gradient-to-r ${feature.color} rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
        
        <div className="text-center mt-16">
          <div className="inline-flex items-center space-x-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-full px-8 py-4 border border-gray-200/50 dark:border-gray-700/50">
            <div className="flex -space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-500 rounded-full border-2 border-white dark:border-gray-800"></div>
              <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-purple-500 rounded-full border-2 border-white dark:border-gray-800"></div>
              <div className="w-8 h-8 bg-gradient-to-br from-pink-400 to-pink-500 rounded-full border-2 border-white dark:border-gray-800"></div>
            </div>
            <span className="text-gray-700 dark:text-gray-300 font-medium">Join thousands of creative teams</span>
          </div>
        </div>
      </div>
    </section>
  );
};