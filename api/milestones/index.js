// API route for milestones - with database integration
import { getMilestones, createMilestone } from "../db";

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader("Access-Control-Allow-Credentials", true);
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET,OPTIONS,PATCH,DELETE,POST,PUT"
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization"
  );

  // Handle OPTIONS method (preflight requests)
  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  // For debugging
  console.log(`API route called: ${req.method} ${req.url}`);
  console.log("Headers:", req.headers);

  try {
    if (req.method === "GET") {
      console.log("GET request to /api/milestones");
      try {
        // Fetch milestones from database
        const milestones = await getMilestones();
        console.log(`Retrieved ${milestones.length} milestones from database`);
        return res.status(200).json(milestones);
      } catch (dbError) {
        console.error("Database error when fetching milestones:", dbError);
        // Fallback to mock data if database fails
        return res
          .status(200)
          .json([
            {
              id: "1",
              title: "Complete 10 Tasks",
              description: "Complete 10 tasks to unlock this milestone",
              progress: 3,
              target: 10,
            },
          ]);
      }
    }

    if (req.method === "POST") {
      console.log("POST request to /api/milestones");

      // Parse the request body if needed
      let milestoneData;
      try {
        // If body is already parsed by Vercel
        if (req.body && typeof req.body === "object") {
          milestoneData = req.body;
        }
        // If body is a string, parse it
        else if (req.body && typeof req.body === "string") {
          milestoneData = JSON.parse(req.body);
        }
        // If no body, return empty object
        else {
          milestoneData = {};
        }
      } catch (e) {
        console.error("Error parsing request body:", e);
        return res.status(400).json({ error: "Invalid request body" });
      }

      console.log("Creating milestone with data:", milestoneData);

      try {
        // Save milestone to database
        const newMilestone = await createMilestone(milestoneData);
        console.log("Milestone created in database:", newMilestone);
        return res.status(201).json(newMilestone);
      } catch (dbError) {
        console.error("Database error when creating milestone:", dbError);
        // Fallback to mock response if database fails
        return res.status(201).json({
          id: Date.now().toString(),
          ...milestoneData,
          createdAt: new Date().toISOString(),
        });
      }
    }

    // Method not allowed
    return res.status(405).json({ error: `Method ${req.method} not allowed` });
  } catch (error) {
    console.error("API error:", error);
    return res
      .status(500)
      .json({ error: "Internal server error", details: error.message });
  }
}
