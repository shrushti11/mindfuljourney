import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import Stripe from "stripe";
import { z } from "zod";
import { insertJournalEntrySchema, insertMoodEntrySchema } from "@shared/schema";

// Initialize Stripe with the API key
const stripeKey = process.env.STRIPE_SECRET_KEY || "";
const stripe = stripeKey ? new Stripe(stripeKey, { apiVersion: "2023-10-16" }) : null;

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication routes
  setupAuth(app);

  // Middleware to check if user is authenticated
  const requireAuth = (req: Request, res: Response, next: any) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    next();
  };

  // Journal Entries CRUD
  app.get("/api/journal-entries", requireAuth, async (req, res) => {
    try {
      const userId = req.user?.id;
      const entries = await storage.getJournalEntriesByUserId(userId!);
      res.json(entries);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/journal-entries", requireAuth, async (req, res) => {
    try {
      const validation = insertJournalEntrySchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ message: "Invalid data" });
      }
      
      const entry = await storage.createJournalEntry(validation.data);
      res.status(201).json(entry);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/journal-entries/:id", requireAuth, async (req, res) => {
    try {
      const entryId = parseInt(req.params.id);
      const entry = await storage.getJournalEntry(entryId);
      
      if (!entry) {
        return res.status(404).json({ message: "Journal entry not found" });
      }
      
      if (entry.userId !== req.user?.id) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      res.json(entry);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.patch("/api/journal-entries/:id", requireAuth, async (req, res) => {
    try {
      const entryId = parseInt(req.params.id);
      const entry = await storage.getJournalEntry(entryId);
      
      if (!entry) {
        return res.status(404).json({ message: "Journal entry not found" });
      }
      
      if (entry.userId !== req.user?.id) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      const updatedEntry = await storage.updateJournalEntry(entryId, req.body);
      res.json(updatedEntry);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.delete("/api/journal-entries/:id", requireAuth, async (req, res) => {
    try {
      const entryId = parseInt(req.params.id);
      const entry = await storage.getJournalEntry(entryId);
      
      if (!entry) {
        return res.status(404).json({ message: "Journal entry not found" });
      }
      
      if (entry.userId !== req.user?.id) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      await storage.deleteJournalEntry(entryId);
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Mood Entries
  app.get("/api/mood", requireAuth, async (req, res) => {
    try {
      const userId = req.user?.id;
      const entries = await storage.getMoodEntriesByUserId(userId!);
      res.json(entries);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/mood", requireAuth, async (req, res) => {
    try {
      const data = {
        ...req.body,
        userId: req.user?.id,
      };
      
      const validation = insertMoodEntrySchema.safeParse(data);
      if (!validation.success) {
        return res.status(400).json({ message: "Invalid data" });
      }
      
      const entry = await storage.createMoodEntry(validation.data);
      res.status(201).json(entry);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Mindfulness Sessions
  app.get("/api/mindfulness-sessions", async (req, res) => {
    try {
      const sessions = await storage.getMindfulnessSessions();
      res.json(sessions);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Reflection Prompts
  app.get("/api/reflection-prompts", async (req, res) => {
    try {
      const prompts = await storage.getReflectionPrompts();
      res.json(prompts);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Stripe subscription endpoint
  app.post("/api/create-subscription", requireAuth, async (req, res) => {
    if (!stripe) {
      return res.status(500).json({ message: "Stripe is not configured" });
    }

    try {
      // Create a PaymentIntent for the subscription
      const paymentIntent = await stripe.paymentIntents.create({
        amount: 499, // $4.99 in cents
        currency: "usd",
        automatic_payment_methods: {
          enabled: true,
        },
        metadata: {
          userId: req.user?.id.toString(),
        },
      });

      // Mark user as premium after successful payment (simplified for demo)
      // In a real app, you would have a webhook to confirm successful payment
      await storage.updateUserPremiumStatus(req.user?.id!, true);

      res.json({ 
        clientSecret: paymentIntent.client_secret 
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Mark user as premium (for testing without Stripe)
  if (process.env.NODE_ENV !== "production") {
    app.post("/api/mock-premium", requireAuth, async (req, res) => {
      try {
        await storage.updateUserPremiumStatus(req.user?.id!, true);
        const user = await storage.getUser(req.user?.id!);
        res.json(user);
      } catch (error: any) {
        res.status(500).json({ message: error.message });
      }
    });
  }

  const httpServer = createServer(app);
  return httpServer;
}
