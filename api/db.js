// Database connector for API routes
import { neon } from "@neondatabase/serverless";

// Initialize the Neon PostgreSQL connection
const initDb = () => {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    console.error("DATABASE_URL environment variable is not set");
    throw new Error("Database connection string not found");
  }

  try {
    console.log("Connecting to Neon PostgreSQL database");
    const sql = neon(connectionString);
    return sql;
  } catch (error) {
    console.error("Failed to connect to database:", error);
    throw error;
  }
};

// Get database connection
export const getDb = () => {
  try {
    return initDb();
  } catch (error) {
    console.error("Error getting database connection:", error);
    throw error;
  }
};

// Tasks table operations
export async function getTasks() {
  const sql = getDb();
  try {
    const tasks = await sql`SELECT * FROM tasks ORDER BY created_at DESC`;
    return tasks;
  } catch (error) {
    console.error("Error getting tasks:", error);
    throw error;
  }
}

export async function createTask(task) {
  const sql = getDb();
  try {
    const result = await sql`
      INSERT INTO tasks (title, description, category, due_date, completed)
      VALUES (${task.title}, ${task.description}, ${task.category}, ${
      task.dueDate
    }, ${task.completed || false})
      RETURNING *
    `;
    return result[0];
  } catch (error) {
    console.error("Error creating task:", error);
    throw error;
  }
}

// Milestones table operations
export async function getMilestones() {
  const sql = getDb();
  try {
    const milestones =
      await sql`SELECT * FROM milestones ORDER BY created_at DESC`;
    return milestones;
  } catch (error) {
    console.error("Error getting milestones:", error);
    throw error;
  }
}

export async function createMilestone(milestone) {
  const sql = getDb();
  try {
    const result = await sql`
      INSERT INTO milestones (title, description, progress, target, due_date)
      VALUES (${milestone.title}, ${milestone.description}, ${
      milestone.progress || 0
    }, ${milestone.target}, ${milestone.dueDate})
      RETURNING *
    `;
    return result[0];
  } catch (error) {
    console.error("Error creating milestone:", error);
    throw error;
  }
}
