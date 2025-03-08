import {
  pgTable,
  text,
  serial,
  integer,
  timestamp,
  boolean,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  photoUrl: text("photo_url"),
});

export const tasks = pgTable("tasks", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  category: text("category").notNull(),
  dueDate: timestamp("due_date"),
  completed: boolean("completed").default(false),
});

export const timeEntries = pgTable("time_entries", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  taskId: integer("task_id").notNull(),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time"),
  duration: integer("duration"), // in minutes
});

export const milestones = pgTable("milestones", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  targetDate: timestamp("target_date").notNull(),
  completed: boolean("completed").default(false),
});

export const insertUserSchema = createInsertSchema(users).pick({
  email: true,
  name: true,
  photoUrl: true,
});

// Custom schema for task with improved date handling
export const insertTaskSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  category: z.string().min(1, "Category is required"),
  dueDate: z
    .union([z.string().nullable(), z.date().nullable(), z.literal("")])
    .nullable()
    .optional()
    .transform((val) => {
      if (!val) return null;
      if (val === "") return null;
      if (val instanceof Date) return val;
      try {
        return new Date(val);
      } catch {
        return null;
      }
    }),
  completed: z.boolean().default(false),
});

// Custom schema for time entries with proper validation
export const insertTimeEntrySchema = z.object({
  taskId: z.number().int().positive(),
  startTime: z
    .string()
    .or(z.date())
    .transform((val) => (val instanceof Date ? val.toISOString() : val)),
  endTime: z
    .string()
    .or(z.date())
    .transform((val) => (val instanceof Date ? val.toISOString() : val))
    .optional(),
  duration: z.number().int().nonnegative().optional(),
});

// Custom schema for milestones with improved date handling
export const insertMilestoneSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  targetDate: z
    .union([z.string().nullable(), z.date().nullable(), z.literal("")])
    .transform((val) => {
      if (!val) throw new Error("Target date is required");
      if (val === "") throw new Error("Target date is required");
      if (val instanceof Date) return val;
      try {
        return new Date(val);
      } catch {
        throw new Error("Invalid date format");
      }
    }),
  completed: z.boolean().default(false),
});

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Task = typeof tasks.$inferSelect;
export type InsertTask = z.infer<typeof insertTaskSchema>;
export type TimeEntry = typeof timeEntries.$inferSelect;
export type InsertTimeEntry = z.infer<typeof insertTimeEntrySchema>;
export type Milestone = typeof milestones.$inferSelect;
export type InsertMilestone = z.infer<typeof insertMilestoneSchema>;
