import React from 'react';
import { useAuth } from "@/hooks/use-auth";
import { Home, BookOpen, SmilePlus, Music, BarChart2, Sparkles, Settings } from "lucide-react";
import { Link, useLocation } from "wouter";

export default function Sidebar() {
  const { user, logoutMutation } = useAuth();
  const [location] = useLocation();

  const isActive = (path: string) => location === path;

  const navItems = [
    { path: "/", label: "Dashboard", icon: <Home className="h-5 w-5 mr-3" /> },
    { path: "/journal", label: "Journal", icon: <BookOpen className="h-5 w-5 mr-3" /> },
    { path: "/mood", label: "Mood Tracker", icon: <SmilePlus className="h-5 w-5 mr-3" /> },
    { path: "/mindfulness", label: "Mindfulness", icon: <Music className="h-5 w-5 mr-3" /> },
    { 
      path: "/premium", 
      label: "Analytics", 
      icon: <BarChart2 className="h-5 w-5 mr-3" />,
      isPremium: true
    },
  ];

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <aside className="hidden md:flex md:w-64 flex-col bg-white border-r border-gray-200 p-4">
      <div className="flex items-center justify-center py-6">
        <h1 className="text-2xl font-bold text-primary">MIND</h1>
      </div>
      <nav className="flex-1 space-y-2 pt-6">
        {navItems.map((item) => (
          <Link 
            key={item.path} 
            href={item.path}
            className={`flex items-center px-4 py-3 rounded-lg ${
              isActive(item.path) 
                ? "text-gray-700 bg-gray-100" 
                : "text-gray-600 hover:bg-gray-100"
            } relative`}
          >
            {React.cloneElement(item.icon, { 
              className: `${item.icon.props.className} ${isActive(item.path) ? "text-primary" : "text-gray-500"}`
            })}
            <span>{item.label}</span>
            {item.isPremium && !user?.isPremium && (
              <span className="absolute top-0 right-0 -mt-2 -mr-2 bg-gradient-to-r from-primary to-primary-600 rounded-full px-2 py-0.5 text-xs font-semibold text-white">
                PRO
              </span>
            )}
          </Link>
        ))}
      </nav>

      <div className="border-t border-gray-200 pt-4 mt-6">
        <div className="bg-primary-50 p-4 rounded-lg">
          <div className="flex items-center">
            <div className="bg-primary rounded-full p-1">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <div className="ml-3">
              <span className="text-sm font-semibold text-gray-800">
                {user?.isPremium ? "Premium Plan" : "Free Plan"}
              </span>
            </div>
          </div>
          {!user?.isPremium && (
            <Link href="/premium">
              <button className="mt-3 w-full bg-primary hover:bg-primary-600 text-white rounded-lg py-2 text-sm font-medium">
                Upgrade to Pro
              </button>
            </Link>
          )}
        </div>
      </div>

      <div className="mt-6">
        <div className="flex items-center">
          <div className="h-8 w-8 rounded-full bg-primary text-white flex items-center justify-center">
            {user?.username.charAt(0).toUpperCase()}
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-gray-700">{user?.username}</p>
            <p className="text-xs text-gray-500">{user?.email}</p>
          </div>
          <Settings 
            className="h-5 w-5 ml-auto text-gray-400 cursor-pointer hover:text-gray-600"
            onClick={handleLogout}
          />
        </div>
      </div>
    </aside>
  );
}