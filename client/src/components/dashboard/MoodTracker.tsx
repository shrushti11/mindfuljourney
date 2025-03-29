import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { MoodEmoji } from "@/types";

export default function MoodTracker() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedMood, setSelectedMood] = useState<string | null>(null);

  const moodEmojis: MoodEmoji[] = [
    { type: "happy", emoji: "😊", label: "Happy" },
    { type: "calm", emoji: "😌", label: "Calm" },
    { type: "neutral", emoji: "😐", label: "Neutral" },
    { type: "sad", emoji: "😔", label: "Sad" },
    { type: "stressed", emoji: "😖", label: "Stressed" },
  ];

  const logMoodMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/mood", {
        userId: user?.id,
        mood: selectedMood,
      });
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Mood logged",
        description: "Your mood has been recorded successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/mood"] });
      setSelectedMood(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to log mood",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleMoodClick = (mood: string) => {
    setSelectedMood(mood);
  };

  const handleLogMood = () => {
    if (selectedMood) {
      logMoodMutation.mutate();
    } else {
      toast({
        title: "No mood selected",
        description: "Please select a mood before logging.",
        variant: "destructive",
      });
    }
  };

  return (
    <section className="mb-8" id="mood-tracker">
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Check in with your mood</h2>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-4 sm:space-y-0">
          <div className="flex space-x-3 sm:space-x-6 overflow-x-auto pb-2 sm:pb-0">
            {moodEmojis.map((mood) => (
              <button
                key={mood.type}
                onClick={() => handleMoodClick(mood.type)}
                className={`mood-emoji flex flex-col items-center transition-transform ${
                  selectedMood === mood.type ? "scale-110" : ""
                }`}
              >
                <span className="text-2xl">{mood.emoji}</span>
                <span className="text-xs mt-1 text-gray-600">{mood.label}</span>
              </button>
            ))}
          </div>
          <Button 
            onClick={handleLogMood} 
            disabled={logMoodMutation.isPending}
            className="bg-primary hover:bg-primary-600"
          >
            {logMoodMutation.isPending ? "Logging..." : "Log Mood"}
          </Button>
        </div>
      </div>
    </section>
  );
}
