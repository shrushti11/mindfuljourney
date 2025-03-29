import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import Sidebar from "@/components/layout/Sidebar";
import MobileHeader from "@/components/layout/MobileHeader";
import MobileNavigation from "@/components/layout/MobileNavigation";
import { useQuery } from "@tanstack/react-query";
import { MindfulnessSession } from "@/types";
import { Loader2, Play, Clock, LucideIcon, Lock, Volume2, Moon, Sun, CloudRain } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import AudioPlayer from "@/components/mindfulness/AudioPlayer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface CategoryProps {
  icon: LucideIcon;
  name: string;
  description: string;
  count: number;
}

export default function MindfulnessPage() {
  const { user } = useAuth();
  const { data: sessions, isLoading } = useQuery<MindfulnessSession[]>({
    queryKey: ["/api/mindfulness-sessions"],
  });
  
  const [playingSession, setPlayingSession] = useState<MindfulnessSession | null>(null);

  const categories: CategoryProps[] = [
    {
      icon: Volume2,
      name: "Meditation",
      description: "Guided meditation sessions for relaxation and focus",
      count: sessions?.filter(s => s.title.toLowerCase().includes("meditation")).length || 0,
    },
    {
      icon: Moon,
      name: "Sleep",
      description: "Calming audio to help you fall asleep faster",
      count: sessions?.filter(s => s.title.toLowerCase().includes("sleep")).length || 0,
    },
    {
      icon: Sun,
      name: "Morning",
      description: "Start your day with positive intentions",
      count: sessions?.filter(s => s.title.toLowerCase().includes("morning")).length || 0,
    },
    {
      icon: CloudRain,
      name: "Ambient",
      description: "Soothing background sounds and white noise",
      count: sessions?.filter(s => s.title.toLowerCase().includes("ambient")).length || 0,
    },
  ];

  const handlePlay = (session: MindfulnessSession) => {
    if (session.isPremium && !user?.isPremium) {
      return;
    }
    setPlayingSession(session);
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-50">
      <Sidebar />
      <MobileHeader />
      
      <main className="flex-1 p-4 md:p-6 overflow-y-auto pb-16 md:pb-6">
        <header className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Mindfulness</h1>
          <p className="mt-2 text-gray-600">Audio sessions to reduce stress and improve focus</p>
        </header>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {categories.map((category) => (
            <Card key={category.name} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <div className="bg-primary-100 w-12 h-12 rounded-full flex items-center justify-center mb-2">
                  <category.icon className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>{category.name}</CardTitle>
              </CardHeader>
              <CardContent className="pb-2">
                <p className="text-sm text-gray-600">{category.description}</p>
              </CardContent>
              <CardFooter>
                <p className="text-sm text-gray-500">{category.count} sessions</p>
              </CardFooter>
            </Card>
          ))}
        </div>
        
        <Tabs defaultValue="all">
          <TabsList className="mb-6">
            <TabsTrigger value="all">All Sessions</TabsTrigger>
            <TabsTrigger value="free">Free</TabsTrigger>
            <TabsTrigger value="premium">Premium</TabsTrigger>
          </TabsList>
          
          {isLoading ? (
            <div className="flex justify-center p-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : sessions && sessions.length > 0 ? (
            <>
              <TabsContent value="all">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {sessions.map((session) => (
                    <Card key={session.id} className="hover:shadow-md transition-shadow relative">
                      {session.isPremium && !user?.isPremium && (
                        <span className="absolute top-0 right-0 -mt-2 -mr-2 bg-gradient-to-r from-primary to-primary-600 rounded-full px-2 py-0.5 text-xs font-semibold text-white">
                          PRO
                        </span>
                      )}
                      <CardHeader>
                        <div className="bg-primary-100 rounded-lg h-40 flex items-center justify-center">
                          <Play className="h-12 w-12 text-primary" />
                        </div>
                      </CardHeader>
                      <CardContent>
                        <CardTitle className="mb-2">{session.title}</CardTitle>
                        <div className="flex items-center text-sm text-gray-500 mb-4">
                          <Clock className="h-4 w-4 mr-1" />
                          <span>{session.duration} minutes</span>
                        </div>
                        <p className="text-gray-600 text-sm line-clamp-2">
                          {session.description || "Guided mindfulness session to help you relax and focus."}
                        </p>
                      </CardContent>
                      <CardFooter>
                        {session.isPremium && !user?.isPremium ? (
                          <Link href="/premium">
                            <Button className="w-full bg-primary hover:bg-primary-600">
                              <Lock className="h-4 w-4 mr-2" />
                              Unlock
                            </Button>
                          </Link>
                        ) : (
                          <Button 
                            variant="outline" 
                            className="w-full"
                            onClick={() => handlePlay(session)}
                          >
                            <Play className="h-4 w-4 mr-2" />
                            Play
                          </Button>
                        )}
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              </TabsContent>
              
              <TabsContent value="free">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {sessions.filter(s => !s.isPremium).map((session) => (
                    <Card key={session.id} className="hover:shadow-md transition-shadow">
                      <CardHeader>
                        <div className="bg-primary-100 rounded-lg h-40 flex items-center justify-center">
                          <Play className="h-12 w-12 text-primary" />
                        </div>
                      </CardHeader>
                      <CardContent>
                        <CardTitle className="mb-2">{session.title}</CardTitle>
                        <div className="flex items-center text-sm text-gray-500 mb-4">
                          <Clock className="h-4 w-4 mr-1" />
                          <span>{session.duration} minutes</span>
                        </div>
                        <p className="text-gray-600 text-sm line-clamp-2">
                          {session.description || "Guided mindfulness session to help you relax and focus."}
                        </p>
                      </CardContent>
                      <CardFooter>
                        <Button 
                          variant="outline" 
                          className="w-full"
                          onClick={() => handlePlay(session)}
                        >
                          <Play className="h-4 w-4 mr-2" />
                          Play
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              </TabsContent>
              
              <TabsContent value="premium">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {sessions.filter(s => s.isPremium).map((session) => (
                    <Card key={session.id} className="hover:shadow-md transition-shadow relative">
                      {!user?.isPremium && (
                        <span className="absolute top-0 right-0 -mt-2 -mr-2 bg-gradient-to-r from-primary to-primary-600 rounded-full px-2 py-0.5 text-xs font-semibold text-white">
                          PRO
                        </span>
                      )}
                      <CardHeader>
                        <div className="bg-primary-100 rounded-lg h-40 flex items-center justify-center">
                          <Play className="h-12 w-12 text-primary" />
                        </div>
                      </CardHeader>
                      <CardContent>
                        <CardTitle className="mb-2">{session.title}</CardTitle>
                        <div className="flex items-center text-sm text-gray-500 mb-4">
                          <Clock className="h-4 w-4 mr-1" />
                          <span>{session.duration} minutes</span>
                        </div>
                        <p className="text-gray-600 text-sm line-clamp-2">
                          {session.description || "Guided mindfulness session to help you relax and focus."}
                        </p>
                      </CardContent>
                      <CardFooter>
                        {!user?.isPremium ? (
                          <Link href="/premium">
                            <Button className="w-full bg-primary hover:bg-primary-600">
                              <Lock className="h-4 w-4 mr-2" />
                              Unlock
                            </Button>
                          </Link>
                        ) : (
                          <Button 
                            variant="outline" 
                            className="w-full"
                            onClick={() => handlePlay(session)}
                          >
                            <Play className="h-4 w-4 mr-2" />
                            Play
                          </Button>
                        )}
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            </>
          ) : (
            <div className="bg-white rounded-xl shadow-sm p-12 text-center">
              <h3 className="text-lg font-medium text-gray-700 mb-4">No mindfulness sessions available</h3>
              <p className="text-gray-500">
                Please check back later for mindfulness content.
              </p>
            </div>
          )}
        </Tabs>
      </main>
      
      {playingSession && (
        <AudioPlayer 
          session={playingSession} 
          onClose={() => setPlayingSession(null)} 
        />
      )}
      
      <MobileNavigation />
    </div>
  );
}
