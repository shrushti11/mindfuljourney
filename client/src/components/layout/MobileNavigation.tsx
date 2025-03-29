import { Link, useLocation } from "wouter";
import { Home, BookOpen, SmilePlus, Music } from "lucide-react";

export default function MobileNavigation() {
  const [location] = useLocation();

  const isActive = (path: string) => location === path;

  const navItems = [
    { path: "/", label: "Home", icon: Home },
    { path: "/journal", label: "Journal", icon: BookOpen },
    { path: "/mood", label: "Mood", icon: SmilePlus },
    { path: "/mindfulness", label: "Mindful", icon: Music },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-2 z-10">
      <div className="flex justify-around items-center">
        {navItems.map((item) => (
          <Link 
            key={item.path} 
            href={item.path}
            className={`flex flex-col items-center p-2 ${
              isActive(item.path) ? "text-primary" : "text-gray-500"
            }`}
          >
            <item.icon className="h-6 w-6" />
            <span className="text-xs mt-1">{item.label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}
