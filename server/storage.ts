import {
  type User,
  type InsertUser,
  type Task,
  type InsertTask,
  type TimeEntry,
  type InsertTimeEntry,
  type Milestone,
  type InsertMilestone,
} from "@shared/schema";

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
  updateTimeEntry(id: number, entry: Partial<InsertTimeEntry>): Promise<TimeEntry>;

  // Milestone operations
  getMilestones(userId: number): Promise<Milestone[]>;
  createMilestone(userId: number, milestone: InsertMilestone): Promise<Milestone>;
  updateMilestone(id: number, milestone: Partial<InsertMilestone>): Promise<Milestone>;
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
    return task;
  }

  async updateTask(id: number, updateTask: Partial<InsertTask>): Promise<Task> {
    const task = this.tasks.get(id);
    if (!task) throw new Error("Task not found");
    const updatedTask = { ...task };
    if (updateTask.title !== undefined) updatedTask.title = updateTask.title;
    if (updateTask.description !== undefined) updatedTask.description = updateTask.description ?? null;
    if (updateTask.category !== undefined) updatedTask.category = updateTask.category;
    if (updateTask.dueDate !== undefined) updatedTask.dueDate = updateTask.dueDate ?? null;
    if (updateTask.completed !== undefined) updatedTask.completed = updateTask.completed ?? false;
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
    if (updateEntry.taskId !== undefined) updatedEntry.taskId = updateEntry.taskId;
    if (updateEntry.startTime !== undefined) updatedEntry.startTime = updateEntry.startTime;
    if (updateEntry.endTime !== undefined) updatedEntry.endTime = updateEntry.endTime ?? null;
    if (updateEntry.duration !== undefined) updatedEntry.duration = updateEntry.duration ?? null;
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
    const id = this.currentId.milestones++;
    const milestone: Milestone = {
      id,
      userId,
      title: insertMilestone.title,
      description: insertMilestone.description ?? null,
      targetDate: insertMilestone.targetDate,
      completed: insertMilestone.completed ?? false,
    };
    this.milestones.set(id, milestone);
    return milestone;
  }

  async updateMilestone(
    id: number,
    updateMilestone: Partial<InsertMilestone>
  ): Promise<Milestone> {
    const milestone = this.milestones.get(id);
    if (!milestone) throw new Error("Milestone not found");
    const updatedMilestone = { ...milestone };
    if (updateMilestone.title !== undefined) updatedMilestone.title = updateMilestone.title;
    if (updateMilestone.description !== undefined) updatedMilestone.description = updateMilestone.description ?? null;
    if (updateMilestone.targetDate !== undefined) updatedMilestone.targetDate = updateMilestone.targetDate;
    if (updateMilestone.completed !== undefined) updatedMilestone.completed = updateMilestone.completed ?? false;
    this.milestones.set(id, updatedMilestone);
    return updatedMilestone;
  }

  async deleteMilestone(id: number): Promise<void> {
    this.milestones.delete(id);
  }
}

export const storage = new MemStorage();