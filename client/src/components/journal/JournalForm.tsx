import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { JournalEntry } from "@/types";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { insertJournalEntrySchema } from "@shared/schema";
import { Loader2 } from "lucide-react";

interface JournalFormProps {
  entry?: JournalEntry;
  onSuccess?: () => void;
}

export default function JournalForm({ entry, onSuccess }: JournalFormProps) {
  const { user } = useAuth();
  const { toast } = useToast();

  // Extend validation schema
  const formSchema = z.object({
    title: z.string().min(1, "Title is required"),
    content: z.string().min(10, "Journal content must be at least 10 characters"),
    mood: z.string().min(1, "Please select a mood"),
    userId: z.number(),
  });

  // Initialize form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: entry?.title || "",
      content: entry?.content || "",
      mood: entry?.mood || "",
      userId: user?.id || 0,
    },
  });

  // Update form values when user or entry changes
  useEffect(() => {
    if (user) {
      form.setValue("userId", user.id);
    }
    if (entry) {
      form.setValue("title", entry.title);
      form.setValue("content", entry.content);
      form.setValue("mood", entry.mood);
    }
  }, [user, entry, form]);

  // Create or update journal entry
  const mutation = useMutation({
    mutationFn: async (values: z.infer<typeof formSchema>) => {
      const url = entry 
        ? `/api/journal-entries/${entry.id}` 
        : "/api/journal-entries";
      const method = entry ? "PATCH" : "POST";
      const res = await apiRequest(method, url, values);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: entry ? "Journal entry updated" : "Journal entry created",
        description: entry 
          ? "Your journal entry has been updated successfully." 
          : "Your journal entry has been saved successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/journal-entries"] });
      form.reset();
      if (onSuccess) onSuccess();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Handle form submission
  const onSubmit = (values: z.infer<typeof formSchema>) => {
    mutation.mutate(values);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="Enter a title for your journal entry" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="mood"
          render={({ field }) => (
            <FormItem>
              <FormLabel>How are you feeling?</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a mood" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="happy">😊 Happy</SelectItem>
                  <SelectItem value="calm">😌 Calm</SelectItem>
                  <SelectItem value="neutral">😐 Neutral</SelectItem>
                  <SelectItem value="sad">😔 Sad</SelectItem>
                  <SelectItem value="stressed">😖 Stressed</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Journal Entry</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Write your thoughts here..." 
                  className="min-h-[200px]" 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <Button 
          type="submit" 
          className="w-full bg-primary hover:bg-primary-600"
          disabled={mutation.isPending}
        >
          {mutation.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {entry ? "Updating..." : "Saving..."}
            </>
          ) : (
            entry ? "Update Entry" : "Save Entry"
          )}
        </Button>
      </form>
    </Form>
  );
}
