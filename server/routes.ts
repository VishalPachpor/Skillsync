import type { Express } from "express";
import { createServer } from "http";
import { storage } from "./storage";
import { insertTaskSchema, insertTimeEntrySchema, insertMilestoneSchema } from "@shared/schema";

export async function registerRoutes(app: Express) {
  // Tasks endpoints
  app.get("/api/tasks", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const tasks = await storage.getTasks(req.session.userId);
    res.json(tasks);
  });

  app.post("/api/tasks", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    const result = insertTaskSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ message: "Invalid task data" });
    }
    
    const task = await storage.createTask(req.session.userId, result.data);
    res.json(task);
  });

  app.patch("/api/tasks/:id", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const taskId = parseInt(req.params.id);
    const task = await storage.getTask(taskId);
    
    if (!task || task.userId !== req.session.userId) {
      return res.status(404).json({ message: "Task not found" });
    }

    const result = insertTaskSchema.partial().safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ message: "Invalid task data" });
    }

    const updatedTask = await storage.updateTask(taskId, result.data);
    res.json(updatedTask);
  });

  app.delete("/api/tasks/:id", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const taskId = parseInt(req.params.id);
    const task = await storage.getTask(taskId);
    
    if (!task || task.userId !== req.session.userId) {
      return res.status(404).json({ message: "Task not found" });
    }

    await storage.deleteTask(taskId);
    res.status(204).send();
  });

  // Time entries endpoints
  app.get("/api/time-entries", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const entries = await storage.getTimeEntries(req.session.userId);
    res.json(entries);
  });

  app.post("/api/time-entries", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const result = insertTimeEntrySchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ message: "Invalid time entry data" });
    }

    const entry = await storage.createTimeEntry(req.session.userId, result.data);
    res.json(entry);
  });

  // Milestones endpoints
  app.get("/api/milestones", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const milestones = await storage.getMilestones(req.session.userId);
    res.json(milestones);
  });

  app.post("/api/milestones", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const result = insertMilestoneSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ message: "Invalid milestone data" });
    }

    const milestone = await storage.createMilestone(req.session.userId, result.data);
    res.json(milestone);
  });

  app.patch("/api/milestones/:id", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const milestoneId = parseInt(req.params.id);
    const milestone = await storage.getMilestones(req.session.userId)
      .then(ms => ms.find(m => m.id === milestoneId));
    
    if (!milestone) {
      return res.status(404).json({ message: "Milestone not found" });
    }

    const result = insertMilestoneSchema.partial().safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ message: "Invalid milestone data" });
    }

    const updatedMilestone = await storage.updateMilestone(milestoneId, result.data);
    res.json(updatedMilestone);
  });

  const httpServer = createServer(app);
  return httpServer;
}
