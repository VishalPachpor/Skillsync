// API route for tasks - using proper Vercel serverless function structure

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
      console.log("GET request to /api/tasks");
      return res.status(200).json([
        {
          id: "1",
          title: "Sample Task",
          description: "This is a sample task",
          completed: false,
        },
      ]);
    }

    if (req.method === "POST") {
      console.log("POST request to /api/tasks");

      // Parse the request body if needed
      let taskData;
      try {
        // If body is already parsed by Vercel
        if (req.body && typeof req.body === "object") {
          taskData = req.body;
        }
        // If body is a string, parse it
        else if (req.body && typeof req.body === "string") {
          taskData = JSON.parse(req.body);
        }
        // If no body, return empty object
        else {
          taskData = {};
        }
      } catch (e) {
        console.error("Error parsing request body:", e);
        return res.status(400).json({ error: "Invalid request body" });
      }

      console.log("Creating task with data:", taskData);

      // Always return a success response
      return res.status(201).json({
        id: Date.now().toString(),
        ...taskData,
        createdAt: new Date().toISOString(),
      });
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
