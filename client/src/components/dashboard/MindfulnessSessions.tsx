import { Button } from "@/components/ui/button";
import { Play, Lock } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { MindfulnessSession } from "@/types";
import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import { Link } from "wouter";
import { useState } from "react";
import AudioPlayer from "../mindfulness/AudioPlayer";

export default function MindfulnessSessions() {
  const { user } = useAuth();
  const { data: sessions, isLoading } = useQuery<MindfulnessSession[]>({
    queryKey: ["/api/mindfulness-sessions"],
  });
  
  const [playingSession, setPlayingSession] = useState<MindfulnessSession | null>(null);

  const handlePlay = (session: MindfulnessSession) => {
    if (session.isPremium && !user?.isPremium) {
      return;
    }
    setPlayingSession(session);
  };

  return (
    <section className="mb-8">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Mindfulness Sessions</h2>
      {isLoading ? (
        <div className="flex justify-center p-6">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : sessions && sessions.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {sessions.map((session) => (
            <div key={session.id} className="bg-white rounded-xl shadow-sm p-5 hover:shadow-md transition-shadow relative">
              {session.isPremium && !user?.isPremium && (
                <span className="absolute top-0 right-0 -mt-2 -mr-2 bg-gradient-to-r from-primary to-primary-600 rounded-full px-2 py-0.5 text-xs font-semibold text-white">
                  PRO
                </span>
              )}
              <div className="bg-primary-100 rounded-lg h-40 flex items-center justify-center mb-3">
                <Play className="h-12 w-12 text-primary" />
              </div>
              <h3 className="font-medium text-gray-900">{session.title}</h3>
              <div className="flex justify-between items-center mt-2">
                <span className="text-sm text-gray-500">{session.duration} minutes</span>
                <div className="audio-wave">
                  <span></span>
                  <span></span>
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
              {session.isPremium && !user?.isPremium ? (
                <Link href="/premium">
                  <Button className="mt-3 w-full bg-primary hover:bg-primary-600">
                    <Lock className="h-4 w-4 mr-2" />
                    Unlock
                  </Button>
                </Link>
              ) : (
                <Button 
                  variant="outline" 
                  className="mt-3 w-full"
                  onClick={() => handlePlay(session)}
                >
                  <Play className="h-4 w-4 mr-2" />
                  Play
                </Button>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm p-6 text-center">
          <p className="text-gray-500">No mindfulness sessions available.</p>
        </div>
      )}

      {playingSession && (
        <AudioPlayer 
          session={playingSession} 
          onClose={() => setPlayingSession(null)} 
        />
      )}
    </section>
  );
}
