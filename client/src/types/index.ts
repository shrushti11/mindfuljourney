export type MoodType = "happy" | "calm" | "neutral" | "sad" | "stressed";

export type MoodEmoji = {
  type: MoodType;
  emoji: string;
  label: string;
};

export interface MindfulnessSession {
  id: number;
  title: string;
  description?: string;
  duration: number;
  audioUrl: string;
  isPremium: boolean;
}

export interface ReflectionPrompt {
  id: number;
  prompt: string;
  isPremium: boolean;
}

export interface JournalEntry {
  id: number;
  userId: number;
  title: string;
  content: string;
  mood: string;
  createdAt: string;
}

export interface MoodEntry {
  id: number;
  userId: number;
  mood: string;
  note?: string;
  createdAt: string;
}

export interface CalendarDay {
  date: number;
  isCurrentMonth: boolean;
  mood?: MoodType;
  isToday?: boolean;
}
