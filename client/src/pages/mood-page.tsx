import { useAuth } from "@/hooks/use-auth";
import Sidebar from "@/components/layout/Sidebar";
import MobileHeader from "@/components/layout/MobileHeader";
import MobileNavigation from "@/components/layout/MobileNavigation";
import { useQuery } from "@tanstack/react-query";
import { MoodEntry } from "@/types";
import { Loader2 } from "lucide-react";
import { format, subDays, eachDayOfInterval } from "date-fns";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function MoodPage() {
  const { user } = useAuth();
  const { data: moodEntries, isLoading } = useQuery<MoodEntry[]>({
    queryKey: ["/api/mood"],
  });

  const moodEmojis = {
    happy: "😊",
    calm: "😌",
    neutral: "😐",
    sad: "😔",
    stressed: "😖",
  };

  const moodColors = {
    happy: "#4ADE80",
    calm: "#60A5FA",
    neutral: "#A1A1AA",
    sad: "#94A3B8",
    stressed: "#F87171",
  };

  const getMoodScore = (mood: string): number => {
    const scores = {
      happy: 5,
      calm: 4,
      neutral: 3,
      sad: 2,
      stressed: 1,
    };
    return scores[mood as keyof typeof scores] || 3;
  };

  const prepareDailyMoodData = () => {
    if (!moodEntries || moodEntries.length === 0) return [];
    
    const today = new Date();
    const lastWeek = subDays(today, 6);
    
    const days = eachDayOfInterval({ start: lastWeek, end: today });
    
    return days.map(day => {
      const dayStr = format(day, "yyyy-MM-dd");
      const dayMoods = moodEntries.filter(entry => {
        const entryDate = new Date(entry.createdAt);
        return format(entryDate, "yyyy-MM-dd") === dayStr;
      });
      
      if (dayMoods.length === 0) {
        return {
          date: format(day, "EEE"),
          score: 0,
          dayWithNoData: true,
        };
      }
      
      const averageScore = dayMoods.reduce((sum, entry) => sum + getMoodScore(entry.mood), 0) / dayMoods.length;
      
      return {
        date: format(day, "EEE"),
        score: parseFloat(averageScore.toFixed(1)),
        mood: dayMoods[dayMoods.length - 1].mood,
      };
    });
  };

  const prepareMoodDistributionData = () => {
    if (!moodEntries || moodEntries.length === 0) return [];
    
    const moodCounts = {
      happy: 0,
      calm: 0,
      neutral: 0,
      sad: 0,
      stressed: 0,
    };
    
    moodEntries.forEach(entry => {
      if (moodCounts[entry.mood as keyof typeof moodCounts] !== undefined) {
        moodCounts[entry.mood as keyof typeof moodCounts]++;
      }
    });
    
    return Object.entries(moodCounts).map(([mood, count]) => ({
      name: mood,
      value: count,
      emoji: moodEmojis[mood as keyof typeof moodEmojis],
    }));
  };

  const dailyMoodData = prepareDailyMoodData();
  const moodDistributionData = prepareMoodDistributionData();

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      if (data.dayWithNoData) {
        return (
          <div className="bg-white p-2 border border-gray-200 rounded shadow-sm">
            <p className="text-gray-600">No mood data</p>
          </div>
        );
      }
      return (
        <div className="bg-white p-2 border border-gray-200 rounded shadow-sm">
          <p className="text-sm font-medium">{`Mood: ${data.mood} ${moodEmojis[data.mood as keyof typeof moodEmojis]}`}</p>
          <p className="text-sm text-gray-600">{`Score: ${data.score}`}</p>
        </div>
      );
    }
    return null;
  };

  const CustomPieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-2 border border-gray-200 rounded shadow-sm">
          <p className="text-sm font-medium">{`${data.name} ${data.emoji}`}</p>
          <p className="text-sm text-gray-600">{`Count: ${data.value}`}</p>
          <p className="text-sm text-gray-600">
            {`Percentage: ${((data.value / moodEntries!.length) * 100).toFixed(1)}%`}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-50">
      <Sidebar />
      <MobileHeader />
      
      <main className="flex-1 p-4 md:p-6 overflow-y-auto pb-16 md:pb-6">
        <header className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Mood Tracker</h1>
          <p className="mt-2 text-gray-600">Track and visualize your mood patterns over time</p>
        </header>
        
        {isLoading ? (
          <div className="flex justify-center p-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : moodEntries && moodEntries.length > 0 ? (
          <div className="space-y-6">
            <Tabs defaultValue="weekly">
              <TabsList className="mb-4">
                <TabsTrigger value="weekly">Weekly Overview</TabsTrigger>
                <TabsTrigger value="distribution">Mood Distribution</TabsTrigger>
              </TabsList>
              
              <TabsContent value="weekly">
                <Card>
                  <CardHeader>
                    <CardTitle>Weekly Mood Trend</CardTitle>
                    <CardDescription>
                      Your mood fluctuations over the past week
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={dailyMoodData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" />
                          <YAxis domain={[0, 5]} ticks={[0, 1, 2, 3, 4, 5]} />
                          <Tooltip content={<CustomTooltip />} />
                          <Legend />
                          <Bar
                            dataKey="score"
                            name="Mood Score"
                            fill="url(#colorGradient)"
                            radius={[4, 4, 0, 0]}
                          />
                          <defs>
                            <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.8} />
                              <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0.4} />
                            </linearGradient>
                          </defs>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="mt-4 grid grid-cols-5 gap-2 text-center">
                      <div className="text-xs text-gray-500">
                        <span className="block text-xl">1</span>
                        Stressed
                      </div>
                      <div className="text-xs text-gray-500">
                        <span className="block text-xl">2</span>
                        Sad
                      </div>
                      <div className="text-xs text-gray-500">
                        <span className="block text-xl">3</span>
                        Neutral
                      </div>
                      <div className="text-xs text-gray-500">
                        <span className="block text-xl">4</span>
                        Calm
                      </div>
                      <div className="text-xs text-gray-500">
                        <span className="block text-xl">5</span>
                        Happy
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="distribution">
                <Card>
                  <CardHeader>
                    <CardTitle>Mood Distribution</CardTitle>
                    <CardDescription>
                      Breakdown of your different moods
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={moodDistributionData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                            label={({ name, emoji }) => `${name} ${emoji}`}
                          >
                            {moodDistributionData.map((entry, index) => (
                              <Cell
                                key={`cell-${index}`}
                                fill={moodColors[entry.name as keyof typeof moodColors]}
                              />
                            ))}
                          </Pie>
                          <Tooltip content={<CustomPieTooltip />} />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="mt-4 text-center text-sm text-gray-500">
                      Total moods logged: {moodEntries.length}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
            
            <Card>
              <CardHeader>
                <CardTitle>Recent Mood Entries</CardTitle>
                <CardDescription>
                  Your most recent mood check-ins
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {moodEntries.slice(0, 5).map((entry) => (
                    <div
                      key={entry.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center">
                        <div className="text-2xl mr-4">
                          {moodEmojis[entry.mood as keyof typeof moodEmojis] || "😐"}
                        </div>
                        <div>
                          <div className="font-medium capitalize">{entry.mood}</div>
                          <div className="text-sm text-gray-500">
                            {format(new Date(entry.createdAt), "MMMM d, yyyy 'at' h:mm a")}
                          </div>
                        </div>
                      </div>
                      {entry.note && (
                        <div className="text-sm text-gray-600 max-w-xs truncate">
                          {entry.note}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <h3 className="text-lg font-medium text-gray-700 mb-4">No mood data yet</h3>
            <p className="text-gray-500 mb-6">
              Start tracking your mood to see patterns and insights over time.
            </p>
          </div>
        )}
      </main>
      
      <MobileNavigation />
    </div>
  );
}
