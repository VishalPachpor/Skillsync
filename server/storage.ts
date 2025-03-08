import {
  type User,
  type InsertUser,
  type Task,
  type InsertTask,
  type TimeEntry,
  type InsertTimeEntry,
  type Milestone,
  type InsertMilestone,
  users,
  tasks,
  timeEntries,
  milestones,
} from "@shared/schema";
import { drizzle } from "drizzle-orm/neon-http";
import { eq } from "drizzle-orm";
import { neon } from "@neondatabase/serverless";

// FIXME: This is temporary, we should use environment variables
const DATABASE_URL =
  "postgresql://neondb_owner:npg_dzYoE4I2vFPB@ep-proud-wind-a8tzydyk-pooler.eastus2.azure.neon.tech/neondb?sslmode=require";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Task operations
  getTasks(userId: number): Promise<Task[]>;
  getTask(id: number): Promise<Task | undefined>;
  createTask(userId: number, task: InsertTask): Promise<Task>;
  updateTask(id: number, task: Partial<InsertTask>): Promise<Task>;
  deleteTask(id: number): Promise<void>;

  // Time entry operations
  getTimeEntries(userId: number): Promise<TimeEntry[]>;
  createTimeEntry(userId: number, entry: InsertTimeEntry): Promise<TimeEntry>;
  updateTimeEntry(
    id: number,
    entry: Partial<InsertTimeEntry>
  ): Promise<TimeEntry>;

  // Milestone operations
  getMilestones(userId: number): Promise<Milestone[]>;
  createMilestone(
    userId: number,
    milestone: InsertMilestone
  ): Promise<Milestone>;
  updateMilestone(
    id: number,
    milestone: Partial<InsertMilestone>
  ): Promise<Milestone>;
  deleteMilestone(id: number): Promise<void>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private tasks: Map<number, Task>;
  private timeEntries: Map<number, TimeEntry>;
  private milestones: Map<number, Milestone>;
  private currentId: { [key: string]: number };

  constructor() {
    this.users = new Map();
    this.tasks = new Map();
    this.timeEntries = new Map();
    this.milestones = new Map();
    this.currentId = {
      users: 1,
      tasks: 1,
      timeEntries: 1,
      milestones: 1,
    };
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find((user) => user.email === email);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId.users++;
    const user: User = {
      id,
      email: insertUser.email,
      name: insertUser.name,
      photoUrl: insertUser.photoUrl ?? null,
    };
    this.users.set(id, user);
    return user;
  }

  // Task operations
  async getTasks(userId: number): Promise<Task[]> {
    return Array.from(this.tasks.values()).filter(
      (task) => task.userId === userId
    );
  }

  async getTask(id: number): Promise<Task | undefined> {
    return this.tasks.get(id);
  }

  async createTask(userId: number, insertTask: InsertTask): Promise<Task> {
    console.log("Creating task in memory storage:", { userId, insertTask });
    const id = this.currentId.tasks++;
    const task: Task = {
      id,
      userId,
      title: insertTask.title,
      description: insertTask.description ?? null,
      category: insertTask.category,
      dueDate: insertTask.dueDate ?? null,
      completed: insertTask.completed ?? false,
    };
    this.tasks.set(id, task);
    console.log("Task created:", task);
    return task;
  }

  async updateTask(id: number, updateTask: Partial<InsertTask>): Promise<Task> {
    const task = this.tasks.get(id);
    if (!task) throw new Error("Task not found");
    const updatedTask = { ...task };
    if (updateTask.title !== undefined) updatedTask.title = updateTask.title;
    if (updateTask.description !== undefined)
      updatedTask.description = updateTask.description ?? null;
    if (updateTask.category !== undefined)
      updatedTask.category = updateTask.category;
    if (updateTask.dueDate !== undefined)
      updatedTask.dueDate = updateTask.dueDate ?? null;
    if (updateTask.completed !== undefined)
      updatedTask.completed = updateTask.completed ?? false;
    this.tasks.set(id, updatedTask);
    return updatedTask;
  }

  async deleteTask(id: number): Promise<void> {
    this.tasks.delete(id);
  }

  // Time entry operations
  async getTimeEntries(userId: number): Promise<TimeEntry[]> {
    return Array.from(this.timeEntries.values()).filter(
      (entry) => entry.userId === userId
    );
  }

  async createTimeEntry(
    userId: number,
    insertEntry: InsertTimeEntry
  ): Promise<TimeEntry> {
    const id = this.currentId.timeEntries++;
    const entry: TimeEntry = {
      id,
      userId,
      taskId: insertEntry.taskId,
      startTime: insertEntry.startTime,
      endTime: insertEntry.endTime ?? null,
      duration: insertEntry.duration ?? null,
    };
    this.timeEntries.set(id, entry);
    return entry;
  }

  async updateTimeEntry(
    id: number,
    updateEntry: Partial<InsertTimeEntry>
  ): Promise<TimeEntry> {
    const entry = this.timeEntries.get(id);
    if (!entry) throw new Error("Time entry not found");
    const updatedEntry = { ...entry };
    if (updateEntry.taskId !== undefined)
      updatedEntry.taskId = updateEntry.taskId;
    if (updateEntry.startTime !== undefined)
      updatedEntry.startTime = updateEntry.startTime;
    if (updateEntry.endTime !== undefined)
      updatedEntry.endTime = updateEntry.endTime ?? null;
    if (updateEntry.duration !== undefined)
      updatedEntry.duration = updateEntry.duration ?? null;
    this.timeEntries.set(id, updatedEntry);
    return updatedEntry;
  }

  // Milestone operations
  async getMilestones(userId: number): Promise<Milestone[]> {
    return Array.from(this.milestones.values()).filter(
      (milestone) => milestone.userId === userId
    );
  }

  async createMilestone(
    userId: number,
    insertMilestone: InsertMilestone
  ): Promise<Milestone> {
    console.log("Creating milestone in memory storage:", {
      userId,
      insertMilestone,
    });

    try {
      const id = this.currentId.milestones++;

      // Ensure we have a valid date string for targetDate
      let targetDate = insertMilestone.targetDate;

      // If targetDate is a Date object, convert it to ISO string
      if (targetDate instanceof Date) {
        targetDate = targetDate.toISOString();
      }

      const milestone: Milestone = {
        id,
        userId,
        title: insertMilestone.title,
        description: insertMilestone.description ?? null,
        targetDate,
        completed: insertMilestone.completed ?? false,
      };

      this.milestones.set(id, milestone);
      console.log("Milestone created:", milestone);
      return milestone;
    } catch (error) {
      console.error("Error creating milestone:", error);
      throw error;
    }
  }

  async updateMilestone(
    id: number,
    updateMilestone: Partial<InsertMilestone>
  ): Promise<Milestone> {
    const milestone = this.milestones.get(id);
    if (!milestone) throw new Error("Milestone not found");

    const updatedMilestone = { ...milestone };

    if (updateMilestone.title !== undefined)
      updatedMilestone.title = updateMilestone.title;
    if (updateMilestone.description !== undefined)
      updatedMilestone.description = updateMilestone.description ?? null;

    if (updateMilestone.targetDate !== undefined) {
      // Handle Date objects properly
      if (updateMilestone.targetDate instanceof Date) {
        updatedMilestone.targetDate = updateMilestone.targetDate.toISOString();
      } else {
        updatedMilestone.targetDate = updateMilestone.targetDate;
      }
    }

    if (updateMilestone.completed !== undefined)
      updatedMilestone.completed = updateMilestone.completed ?? false;

    this.milestones.set(id, updatedMilestone);
    return updatedMilestone;
  }

  async deleteMilestone(id: number): Promise<void> {
    this.milestones.delete(id);
  }
}

// Database Storage Implementation
export class DbStorage implements IStorage {
  private db;

  constructor() {
    try {
      // Use the correct connection method for Neon
      const sql = neon(DATABASE_URL);

      // Use drizzle with the HTTP driver for Neon
      this.db = drizzle(sql);

      console.log("Connected to Neon PostgreSQL database");
    } catch (error) {
      console.error("Error connecting to database:", error);
      throw error;
    }
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    try {
      const result = await this.db.select().from(users).where(eq(users.id, id));
      return result[0];
    } catch (error) {
      console.error(`Error getting user ${id}:`, error);
      return undefined;
    }
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    try {
      const result = await this.db
        .select()
        .from(users)
        .where(eq(users.email, email));
      return result[0];
    } catch (error) {
      console.error(`Error getting user by email ${email}:`, error);
      return undefined;
    }
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    try {
      const result = await this.db
        .insert(users)
        .values({
          email: insertUser.email,
          name: insertUser.name,
          photoUrl: insertUser.photoUrl,
        })
        .returning();
      return result[0];
    } catch (error) {
      console.error(`Error creating user:`, error);
      throw error;
    }
  }

  // Task operations
  async getTasks(userId: number): Promise<Task[]> {
    try {
      const result = await this.db
        .select()
        .from(tasks)
        .where(eq(tasks.userId, userId));
      console.log(`Retrieved ${result.length} tasks for user ${userId}`);
      return result;
    } catch (error) {
      console.error(`Error getting tasks for user ${userId}:`, error);
      return [];
    }
  }

  async getTask(id: number): Promise<Task | undefined> {
    try {
      const result = await this.db.select().from(tasks).where(eq(tasks.id, id));
      return result[0];
    } catch (error) {
      console.error(`Error getting task ${id}:`, error);
      return undefined;
    }
  }

  async createTask(userId: number, insertTask: InsertTask): Promise<Task> {
    console.log("Creating task in database:", { userId, task: insertTask });

    try {
      // Convert dueDate to a proper date object if provided
      let dueDate = null;
      if (insertTask.dueDate) {
        dueDate = new Date(insertTask.dueDate);
        console.log("Parsed dueDate:", dueDate);
      }

      // Create a clean task object
      const taskData = {
        userId,
        title: insertTask.title,
        description: insertTask.description ?? null,
        category: insertTask.category,
        dueDate,
        completed: insertTask.completed ?? false,
      };

      console.log("Inserting task with data:", taskData);

      // Insert the task
      const result = await this.db.insert(tasks).values(taskData).returning();

      console.log("Task created successfully:", result[0]);
      return result[0];
    } catch (error) {
      console.error("Error creating task:", error);
      throw error;
    }
  }

  async updateTask(id: number, updateTask: Partial<InsertTask>): Promise<Task> {
    try {
      // Create a clean copy of the data to update
      const updateData: any = {};

      if (updateTask.title !== undefined) updateData.title = updateTask.title;
      if (updateTask.description !== undefined)
        updateData.description = updateTask.description ?? null;
      if (updateTask.category !== undefined)
        updateData.category = updateTask.category;
      if (updateTask.completed !== undefined)
        updateData.completed = updateTask.completed ?? false;

      // Handle date conversion properly
      if (updateTask.dueDate !== undefined) {
        updateData.dueDate = updateTask.dueDate
          ? new Date(updateTask.dueDate)
          : null;
      }

      const result = await this.db
        .update(tasks)
        .set(updateData)
        .where(eq(tasks.id, id))
        .returning();

      if (result.length === 0) {
        throw new Error("Task not found");
      }

      return result[0];
    } catch (error) {
      console.error(`Error updating task ${id}:`, error);
      throw error;
    }
  }

  async deleteTask(id: number): Promise<void> {
    try {
      await this.db.delete(tasks).where(eq(tasks.id, id));
    } catch (error) {
      console.error(`Error deleting task ${id}:`, error);
      throw error;
    }
  }

  // Time entry operations
  async getTimeEntries(userId: number): Promise<TimeEntry[]> {
    try {
      const result = await this.db
        .select()
        .from(timeEntries)
        .where(eq(timeEntries.userId, userId));
      return result;
    } catch (error) {
      console.error(`Error getting time entries for user ${userId}:`, error);
      return [];
    }
  }

  async createTimeEntry(
    userId: number,
    insertEntry: InsertTimeEntry
  ): Promise<TimeEntry> {
    try {
      // Convert timestamps to proper Date objects
      const startTime = new Date(insertEntry.startTime);
      let endTime = null;
      if (insertEntry.endTime) {
        endTime = new Date(insertEntry.endTime);
      }

      const result = await this.db
        .insert(timeEntries)
        .values({
          userId,
          taskId: insertEntry.taskId,
          startTime,
          endTime,
          duration: insertEntry.duration ?? null,
        })
        .returning();

      return result[0];
    } catch (error) {
      console.error(`Error creating time entry:`, error);
      throw error;
    }
  }

  async updateTimeEntry(
    id: number,
    updateEntry: Partial<InsertTimeEntry>
  ): Promise<TimeEntry> {
    try {
      // Create a clean copy of the data to update
      const updateData: any = {};

      if (updateEntry.taskId !== undefined)
        updateData.taskId = updateEntry.taskId;
      if (updateEntry.duration !== undefined)
        updateData.duration = updateEntry.duration ?? null;

      // Handle date conversions properly
      if (updateEntry.startTime !== undefined) {
        updateData.startTime = new Date(updateEntry.startTime);
      }

      if (updateEntry.endTime !== undefined) {
        updateData.endTime = updateEntry.endTime
          ? new Date(updateEntry.endTime)
          : null;
      }

      const result = await this.db
        .update(timeEntries)
        .set(updateData)
        .where(eq(timeEntries.id, id))
        .returning();

      if (result.length === 0) {
        throw new Error("Time entry not found");
      }

      return result[0];
    } catch (error) {
      console.error(`Error updating time entry ${id}:`, error);
      throw error;
    }
  }

  // Milestone operations
  async getMilestones(userId: number): Promise<Milestone[]> {
    try {
      const result = await this.db
        .select()
        .from(milestones)
        .where(eq(milestones.userId, userId));
      return result;
    } catch (error) {
      console.error(`Error getting milestones for user ${userId}:`, error);
      return [];
    }
  }

  async createMilestone(
    userId: number,
    insertMilestone: InsertMilestone
  ): Promise<Milestone> {
    try {
      // Convert targetDate to a proper Date object
      const targetDate = new Date(insertMilestone.targetDate);

      const result = await this.db
        .insert(milestones)
        .values({
          userId,
          title: insertMilestone.title,
          description: insertMilestone.description ?? null,
          targetDate,
          completed: insertMilestone.completed ?? false,
        })
        .returning();

      return result[0];
    } catch (error) {
      console.error(`Error creating milestone:`, error);
      throw error;
    }
  }

  async updateMilestone(
    id: number,
    updateMilestone: Partial<InsertMilestone>
  ): Promise<Milestone> {
    try {
      // Create a clean copy of the data to update
      const updateData: any = {};

      if (updateMilestone.title !== undefined)
        updateData.title = updateMilestone.title;
      if (updateMilestone.description !== undefined)
        updateData.description = updateMilestone.description ?? null;
      if (updateMilestone.completed !== undefined)
        updateData.completed = updateMilestone.completed ?? false;

      // Handle date conversion properly
      if (updateMilestone.targetDate !== undefined) {
        updateData.targetDate = new Date(updateMilestone.targetDate);
      }

      const result = await this.db
        .update(milestones)
        .set(updateData)
        .where(eq(milestones.id, id))
        .returning();

      if (result.length === 0) {
        throw new Error("Milestone not found");
      }

      return result[0];
    } catch (error) {
      console.error(`Error updating milestone ${id}:`, error);
      throw error;
    }
  }

  async deleteMilestone(id: number): Promise<void> {
    try {
      await this.db.delete(milestones).where(eq(milestones.id, id));
    } catch (error) {
      console.error(`Error deleting milestone ${id}:`, error);
      throw error;
    }
  }
}

// Create a user for testing
async function ensureTestUser(storage: IStorage) {
  try {
    // Check if test user exists
    const user = await storage.getUserByEmail("test@example.com");
    if (!user) {
      console.log("Creating test user...");
      await storage.createUser({
        email: "test@example.com",
        name: "Test User",
        photoUrl: null,
      });
      console.log("Test user created");
    }
  } catch (error) {
    console.error("Error ensuring test user:", error);
  }
}

// Switch to database storage for persistent data
export const storage = new DbStorage();
// export const storage = new MemStorage();

// Create a test user if needed
ensureTestUser(storage).catch(console.error);
