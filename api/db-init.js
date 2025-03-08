// Database initialization script
import { executeQuery } from "./db";

// Create tables if they don't exist
export const initializeDatabase = async () => {
  try {
    console.log("Initializing database tables...");

    // Create tasks table
    await executeQuery(`
      CREATE TABLE IF NOT EXISTS tasks (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        category VARCHAR(100),
        due_date TIMESTAMP,
        completed BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log("Tasks table initialized");

    // Create milestones table
    await executeQuery(`
      CREATE TABLE IF NOT EXISTS milestones (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        target INTEGER NOT NULL,
        progress INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log("Milestones table initialized");

    return { success: true, message: "Database initialized successfully" };
  } catch (error) {
    console.error("Error initializing database:", error);
    return { success: false, error: error.message };
  }
};

// Export a function that can be called from the API route
export default async function initDb() {
  return initializeDatabase();
}
