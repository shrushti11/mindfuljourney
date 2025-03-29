import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import Sidebar from "@/components/layout/Sidebar";
import MobileHeader from "@/components/layout/MobileHeader";
import MobileNavigation from "@/components/layout/MobileNavigation";
import JournalForm from "@/components/journal/JournalForm";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { JournalEntry } from "@/types";
import { Loader2, Pencil, Trash2 } from "lucide-react";
import { format } from "date-fns";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function JournalPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [showNewEntryForm, setShowNewEntryForm] = useState(false);
  const [editingEntry, setEditingEntry] = useState<JournalEntry | null>(null);
  const [entryToDelete, setEntryToDelete] = useState<number | null>(null);

  const { data: journalEntries, isLoading } = useQuery<JournalEntry[]>({
    queryKey: ["/api/journal-entries"],
  });

  const deleteEntryMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/journal-entries/${id}`);
    },
    onSuccess: () => {
      toast({
        title: "Journal entry deleted",
        description: "Your journal entry has been deleted successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/journal-entries"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleDeleteEntry = () => {
    if (entryToDelete !== null) {
      deleteEntryMutation.mutate(entryToDelete);
      setEntryToDelete(null);
    }
  };

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

  const formatDateForGrouping = (date: Date) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date >= today) {
      return "Today";
    } else if (date >= yesterday) {
      return "Yesterday";
    } else {
      return format(date, "MMMM yyyy");
    }
  };

  const groupEntriesByDate = (entries: JournalEntry[] | undefined) => {
    if (!entries) return {};
    
    const groups: Record<string, JournalEntry[]> = {};
    
    entries.forEach(entry => {
      const date = new Date(entry.createdAt);
      const groupKey = formatDateForGrouping(date);
      
      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      
      groups[groupKey].push(entry);
    });
    
    return groups;
  };

  const groupedEntries = groupEntriesByDate(journalEntries);

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-50">
      <Sidebar />
      <MobileHeader />
      
      <main className="flex-1 p-4 md:p-6 overflow-y-auto pb-16 md:pb-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Journal</h1>
          <Button 
            className="bg-primary hover:bg-primary-600"
            onClick={() => setShowNewEntryForm(true)}
          >
            New Entry
          </Button>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center p-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : journalEntries && journalEntries.length > 0 ? (
          <div className="space-y-8">
            {Object.entries(groupedEntries).map(([groupTitle, entries]) => (
              <div key={groupTitle}>
                <h2 className="text-lg font-semibold text-gray-700 mb-4">{groupTitle}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {entries.map(entry => (
                    <Card key={entry.id} className="hover:shadow-md transition-shadow">
                      <CardHeader className="pb-2">
                        <div className="flex justify-between">
                          <CardTitle>{entry.title}</CardTitle>
                          <span className="text-xl">{moodToEmoji(entry.mood)}</span>
                        </div>
                        <CardDescription>
                          {format(new Date(entry.createdAt), "EEEE, MMMM d, yyyy 'at' h:mm a")}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="pb-2">
                        <p className="text-gray-700">
                          {entry.content.length > 150 
                            ? `${entry.content.substring(0, 150)}...` 
                            : entry.content}
                        </p>
                      </CardContent>
                      <CardFooter className="flex justify-end space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setEditingEntry(entry)}
                        >
                          <Pencil className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="text-red-500 hover:text-red-600"
                          onClick={() => setEntryToDelete(entry.id)}
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Delete
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <h3 className="text-lg font-medium text-gray-700 mb-4">You haven't created any journal entries yet</h3>
            <p className="text-gray-500 mb-6">
              Start journaling your thoughts and feelings to track your mental well-being over time.
            </p>
            <Button 
              className="bg-primary hover:bg-primary-600"
              onClick={() => setShowNewEntryForm(true)}
            >
              Create Your First Entry
            </Button>
          </div>
        )}
      </main>
      
      <Dialog open={showNewEntryForm} onOpenChange={setShowNewEntryForm}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>New Journal Entry</DialogTitle>
            <DialogDescription>
              Write down your thoughts, feelings, and experiences.
            </DialogDescription>
          </DialogHeader>
          <JournalForm onSuccess={() => setShowNewEntryForm(false)} />
        </DialogContent>
      </Dialog>
      
      <Dialog open={editingEntry !== null} onOpenChange={(open) => !open && setEditingEntry(null)}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Journal Entry</DialogTitle>
            <DialogDescription>
              Update your journal entry.
            </DialogDescription>
          </DialogHeader>
          {editingEntry && (
            <JournalForm entry={editingEntry} onSuccess={() => setEditingEntry(null)} />
          )}
        </DialogContent>
      </Dialog>
      
      <AlertDialog open={entryToDelete !== null} onOpenChange={(open) => !open && setEntryToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your journal entry.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              className="bg-red-500 hover:bg-red-600"
              onClick={handleDeleteEntry}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      <MobileNavigation />
    </div>
  );
}
