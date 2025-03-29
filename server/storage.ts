import { users, type User, type InsertUser, journalEntries, type JournalEntry, type InsertJournalEntry, moodEntries, type MoodEntry, type InsertMoodEntry, mindfulnessSessions, type MindfulnessSession, reflectionPrompts, type ReflectionPrompt } from "@shared/schema";
import createMemoryStore from "memorystore";
import session from "express-session";

const MemoryStore = createMemoryStore(session);

// Interface for the storage system
export interface IStorage {
  // User management
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserPremiumStatus(id: number, isPremium: boolean): Promise<User>;
  updateUserStripeInfo(id: number, customerId: string, subscriptionId: string): Promise<User>;
  
  // Journal entries
  getJournalEntry(id: number): Promise<JournalEntry | undefined>;
  getJournalEntriesByUserId(userId: number): Promise<JournalEntry[]>;
  createJournalEntry(entry: InsertJournalEntry): Promise<JournalEntry>;
  updateJournalEntry(id: number, entry: Partial<JournalEntry>): Promise<JournalEntry>;
  deleteJournalEntry(id: number): Promise<void>;
  
  // Mood entries
  getMoodEntry(id: number): Promise<MoodEntry | undefined>;
  getMoodEntriesByUserId(userId: number): Promise<MoodEntry[]>;
  createMoodEntry(entry: InsertMoodEntry): Promise<MoodEntry>;
  
  // Mindfulness sessions
  getMindfulnessSessions(): Promise<MindfulnessSession[]>;
  getMindfulnessSession(id: number): Promise<MindfulnessSession | undefined>;
  
  // Reflection prompts
  getReflectionPrompts(): Promise<ReflectionPrompt[]>;
  getReflectionPrompt(id: number): Promise<ReflectionPrompt | undefined>;
  
  // Session store for authentication
  sessionStore: session.SessionStore;
}

// In-memory storage implementation
export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private journalEntries: Map<number, JournalEntry>;
  private moodEntries: Map<number, MoodEntry>;
  private mindfulnessSessions: Map<number, MindfulnessSession>;
  private reflectionPrompts: Map<number, ReflectionPrompt>;
  
  sessionStore: session.SessionStore;
  
  private userIdCounter: number;
  private journalIdCounter: number;
  private moodIdCounter: number;
  private sessionIdCounter: number;
  private promptIdCounter: number;

  constructor() {
    this.users = new Map();
    this.journalEntries = new Map();
    this.moodEntries = new Map();
    this.mindfulnessSessions = new Map();
    this.reflectionPrompts = new Map();
    
    this.userIdCounter = 1;
    this.journalIdCounter = 1;
    this.moodIdCounter = 1;
    this.sessionIdCounter = 1;
    this.promptIdCounter = 1;
    
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000 // prune expired entries every 24h
    });
    
    // Initialize with sample mindfulness sessions
    this.initializeMindfulnessSessions();
    
    // Initialize with reflection prompts
    this.initializeReflectionPrompts();
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username.toLowerCase() === username.toLowerCase()
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const createdAt = new Date().toISOString();
    const user: User = { 
      ...insertUser, 
      id, 
      isPremium: false 
    };
    this.users.set(id, user);
    return user;
  }

  async updateUserPremiumStatus(id: number, isPremium: boolean): Promise<User> {
    const user = this.users.get(id);
    if (!user) {
      throw new Error(`User with id ${id} not found`);
    }
    
    const updatedUser = { ...user, isPremium };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async updateUserStripeInfo(id: number, customerId: string, subscriptionId: string): Promise<User> {
    const user = this.users.get(id);
    if (!user) {
      throw new Error(`User with id ${id} not found`);
    }
    
    const updatedUser = { 
      ...user, 
      stripeCustomerId: customerId,
      stripeSubscriptionId: subscriptionId,
      isPremium: true
    };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Journal entry methods
  async getJournalEntry(id: number): Promise<JournalEntry | undefined> {
    return this.journalEntries.get(id);
  }

  async getJournalEntriesByUserId(userId: number): Promise<JournalEntry[]> {
    return Array.from(this.journalEntries.values())
      .filter(entry => entry.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async createJournalEntry(entry: InsertJournalEntry): Promise<JournalEntry> {
    const id = this.journalIdCounter++;
    const createdAt = new Date().toISOString();
    const journalEntry: JournalEntry = { ...entry, id, createdAt };
    this.journalEntries.set(id, journalEntry);
    return journalEntry;
  }

  async updateJournalEntry(id: number, updatedFields: Partial<JournalEntry>): Promise<JournalEntry> {
    const entry = this.journalEntries.get(id);
    if (!entry) {
      throw new Error(`Journal entry with id ${id} not found`);
    }
    
    const updatedEntry = { ...entry, ...updatedFields };
    this.journalEntries.set(id, updatedEntry);
    return updatedEntry;
  }

  async deleteJournalEntry(id: number): Promise<void> {
    if (!this.journalEntries.has(id)) {
      throw new Error(`Journal entry with id ${id} not found`);
    }
    
    this.journalEntries.delete(id);
  }

  // Mood entry methods
  async getMoodEntry(id: number): Promise<MoodEntry | undefined> {
    return this.moodEntries.get(id);
  }

  async getMoodEntriesByUserId(userId: number): Promise<MoodEntry[]> {
    return Array.from(this.moodEntries.values())
      .filter(entry => entry.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async createMoodEntry(entry: InsertMoodEntry): Promise<MoodEntry> {
    const id = this.moodIdCounter++;
    const createdAt = new Date().toISOString();
    const moodEntry: MoodEntry = { ...entry, id, createdAt };
    this.moodEntries.set(id, moodEntry);
    return moodEntry;
  }

  // Mindfulness session methods
  async getMindfulnessSessions(): Promise<MindfulnessSession[]> {
    return Array.from(this.mindfulnessSessions.values());
  }

  async getMindfulnessSession(id: number): Promise<MindfulnessSession | undefined> {
    return this.mindfulnessSessions.get(id);
  }

  // Reflection prompt methods
  async getReflectionPrompts(): Promise<ReflectionPrompt[]> {
    return Array.from(this.reflectionPrompts.values());
  }

  async getReflectionPrompt(id: number): Promise<ReflectionPrompt | undefined> {
    return this.reflectionPrompts.get(id);
  }

  // Initialize sample mindfulness sessions
  private initializeMindfulnessSessions() {
    const sessions: Omit<MindfulnessSession, "id">[] = [
      {
        title: "Morning Meditation",
        description: "Start your day with clarity and intention. This meditation helps you set a positive tone for the day ahead.",
        duration: 10,
        audioUrl: "https://mindfulnessapp.com/audio/morning-meditation.mp3",
        isPremium: false
      },
      {
        title: "Anxiety Relief",
        description: "A guided practice to help reduce feelings of anxiety and stress, focusing on deep breathing and body awareness.",
        duration: 15,
        audioUrl: "https://mindfulnessapp.com/audio/anxiety-relief.mp3",
        isPremium: false
      },
      {
        title: "Deep Sleep Guide",
        description: "Fall asleep faster with this calming meditation designed to quiet the mind and prepare your body for restful sleep.",
        duration: 30,
        audioUrl: "https://mindfulnessapp.com/audio/deep-sleep.mp3",
        isPremium: true
      },
      {
        title: "Focus & Concentration",
        description: "Enhance your ability to focus and concentrate with this mindfulness practice for mental clarity.",
        duration: 12,
        audioUrl: "https://mindfulnessapp.com/audio/focus.mp3",
        isPremium: false
      },
      {
        title: "Body Scan Relaxation",
        description: "A guided body scan meditation to release tension and promote deep relaxation throughout your body.",
        duration: 20,
        audioUrl: "https://mindfulnessapp.com/audio/body-scan.mp3",
        isPremium: false
      },
      {
        title: "Advanced Mindfulness",
        description: "For experienced practitioners, this session explores advanced mindfulness techniques for deeper awareness.",
        duration: 25,
        audioUrl: "https://mindfulnessapp.com/audio/advanced.mp3",
        isPremium: true
      }
    ];

    sessions.forEach(session => {
      const id = this.sessionIdCounter++;
      this.mindfulnessSessions.set(id, { id, ...session });
    });
  }

  // Initialize reflection prompts
  private initializeReflectionPrompts() {
    const prompts: Omit<ReflectionPrompt, "id">[] = [
      {
        prompt: "What made you smile today? Take a moment to reflect on a positive experience, no matter how small.",
        isPremium: false
      },
      {
        prompt: "List three things you're grateful for today and why they matter to you.",
        isPremium: false
      },
      {
        prompt: "Think about a challenge you're facing. What strengths and resources do you have to help you overcome it?",
        isPremium: true
      },
      {
        prompt: "Reflect on a recent interaction that affected you emotionally. What triggered your response and what might you learn from it?",
        isPremium: true
      },
      {
        prompt: "What is one small step you can take today toward a goal that matters to you?",
        isPremium: false
      },
      {
        prompt: "Consider a relationship in your life. How might you nurture it with intention this week?",
        isPremium: false
      },
      {
        prompt: "Explore a belief or thought pattern that may be limiting you. How might you reframe it in a more empowering way?",
        isPremium: true
      }
    ];

    prompts.forEach(prompt => {
      const id = this.promptIdCounter++;
      this.reflectionPrompts.set(id, { id, ...prompt });
    });
  }
}

export const storage = new MemStorage();
