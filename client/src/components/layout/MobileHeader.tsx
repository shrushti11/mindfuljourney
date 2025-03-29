import { useAuth } from "@/hooks/use-auth";
import { Menu } from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Home, BookOpen, SmilePlus, Music, BarChart2, LogOut, Sparkles } from "lucide-react";

export default function MobileHeader() {
  const { user, logoutMutation } = useAuth();
  const [open, setOpen] = useState(false);

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
    setOpen(false);
  };

  return (
    <div className="md:hidden bg-white border-b border-gray-200 p-4">
      <div className="flex items-center justify-between">
        <Link href="/">
          <h1 className="text-xl font-bold text-primary">MIND</h1>
        </Link>
        <div className="flex items-center">
          <div className="h-8 w-8 rounded-full bg-primary text-white flex items-center justify-center mr-4">
            {user?.username.charAt(0).toUpperCase()}
          </div>
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <button className="text-gray-600">
                <Menu className="h-6 w-6" />
              </button>
            </SheetTrigger>
            <SheetContent side="right" className="p-0">
              <div className="flex flex-col h-full">
                <div className="p-4 border-b border-gray-200">
                  <div className="flex items-center">
                    <div className="h-10 w-10 rounded-full bg-primary text-white flex items-center justify-center">
                      {user?.username.charAt(0).toUpperCase()}
                    </div>
                    <div className="ml-3">
                      <p className="font-medium text-gray-700">{user?.username}</p>
                      <p className="text-sm text-gray-500">{user?.email}</p>
                    </div>
                  </div>
                </div>
                <nav className="flex-1 p-4 space-y-2">
                  {navItems.map((item) => (
                    <Link 
                      key={item.path} 
                      href={item.path}
                      onClick={() => setOpen(false)}
                      className="flex items-center px-4 py-3 rounded-lg text-gray-600 hover:bg-gray-100 relative"
                    >
                      {item.icon}
                      <span>{item.label}</span>
                      {item.isPremium && !user?.isPremium && (
                        <span className="absolute right-2 bg-gradient-to-r from-primary to-primary-600 rounded-full px-2 py-0.5 text-xs font-semibold text-white">
                          PRO
                        </span>
                      )}
                    </Link>
                  ))}
                </nav>
                <div className="p-4 border-t border-gray-200">
                  <div className="bg-primary-50 p-4 rounded-lg mb-4">
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
                      <Link href="/premium" onClick={() => setOpen(false)}>
                        <button className="mt-3 w-full bg-primary hover:bg-primary-600 text-white rounded-lg py-2 text-sm font-medium">
                          Upgrade to Pro
                        </button>
                      </Link>
                    )}
                  </div>
                  <button
                    onClick={handleLogout}
                    className="flex items-center px-4 py-3 w-full rounded-lg text-gray-600 hover:bg-gray-100"
                  >
                    <LogOut className="h-5 w-5 mr-3" />
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </div>
  );
}
