import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { JournalEntry } from "@/types";
import { Loader2 } from "lucide-react";

export default function JournalActivity() {
  const { data: journalEntries, isLoading } = useQuery<JournalEntry[]>({
    queryKey: ["/api/journal-entries"],
  });

  const calculateStreak = (entries: JournalEntry[] | undefined) => {
    if (!entries || entries.length === 0) return 0;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let streak = 0;
    let currentDate = new Date(today);
    
    while (true) {
      const dateString = currentDate.toISOString().split('T')[0];
      const entryForDate = entries.some(entry => {
        const entryDate = new Date(entry.createdAt);
        return entryDate.toISOString().split('T')[0] === dateString;
      });
      
      if (entryForDate) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else {
        break;
      }
    }
    
    return streak;
  };

  const getEntriesThisWeek = (entries: JournalEntry[] | undefined) => {
    if (!entries) return 0;
    
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    
    return entries.filter(entry => {
      const entryDate = new Date(entry.createdAt);
      return entryDate >= startOfWeek;
    }).length;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-800">Journal Activity</h2>
        <Link href="/journal" className="text-primary hover:text-primary-600 text-sm font-medium">
          View all
        </Link>
      </div>
      {isLoading ? (
        <div className="flex justify-center p-4">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <span className="text-gray-800 font-medium">Entries this week</span>
            <span className="text-2xl font-semibold text-primary">
              {getEntriesThisWeek(journalEntries)}
            </span>
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <span className="text-gray-800 font-medium">Current streak</span>
            <span className="text-2xl font-semibold text-primary">{calculateStreak(journalEntries)} days</span>
          </div>
          <div className="mt-4">
            <Link href="/journal">
              <Button variant="outline" className="w-full border-primary text-primary hover:bg-primary-50">
                New Journal Entry
              </Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
