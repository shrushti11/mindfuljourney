import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { JournalEntry } from "@/types";
import { Loader2 } from "lucide-react";
import { format } from "date-fns";

export default function JournalEntries() {
  const { data: journalEntries, isLoading } = useQuery<JournalEntry[]>({
    queryKey: ["/api/journal-entries"],
  });

  const moodToEmoji = (mood: string): string => {
    const emojiMap: Record<string, string> = {
      happy: "😊",
      calm: "😌",
      neutral: "😐",
      sad: "😔",
      stressed: "😖",
    };
    return emojiMap[mood] || "😐";
  };

  return (
    <section className="mb-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-800">Recent Journal Entries</h2>
        <Link href="/journal">
          <Button className="bg-primary hover:bg-primary-600">
            <Plus className="h-4 w-4 mr-2" />
            New Entry
          </Button>
        </Link>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center p-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : journalEntries && journalEntries.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {journalEntries.slice(0, 4).map((entry) => (
            <div key={entry.id} className="bg-white rounded-xl shadow-sm p-5 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium text-gray-900">{entry.title}</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {format(new Date(entry.createdAt), "MMMM d, yyyy")}
                  </p>
                </div>
                <span className="text-lg">{moodToEmoji(entry.mood)}</span>
              </div>
              <p className="mt-3 text-gray-700 line-clamp-3">{entry.content}</p>
              <div className="mt-4 flex justify-end">
                <Link href={`/journal/${entry.id}`}>
                  <Button variant="link" className="text-primary hover:text-primary-800">
                    Read more
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm p-6 text-center">
          <p className="text-gray-500 mb-4">You don't have any journal entries yet.</p>
          <Link href="/journal">
            <Button className="bg-primary hover:bg-primary-600">
              Start Journaling
            </Button>
          </Link>
        </div>
      )}
    </section>
  );
}
