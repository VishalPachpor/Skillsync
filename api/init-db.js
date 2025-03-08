// API route to initialize database schema
import { getDb } from "./db";

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Add a simple authorization check
  const authHeader = req.headers.authorization;
  if (!authHeader || authHeader !== `Bearer ${process.env.INIT_DB_TOKEN}`) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    console.log("Initializing database schema...");
    const sql = getDb();

    // Create tasks table
    await sql`
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
    `;
    console.log("Tasks table created or already exists");

    // Create milestones table
    await sql`
      CREATE TABLE IF NOT EXISTS milestones (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        progress INTEGER DEFAULT 0,
        target INTEGER NOT NULL,
        due_date TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    console.log("Milestones table created or already exists");

    return res
      .status(200)
      .json({ message: "Database schema initialized successfully" });
  } catch (error) {
    console.error("Error initializing database schema:", error);
    return res
      .status(500)
      .json({
        error: "Failed to initialize database schema",
        details: error.message,
      });
  }
}
