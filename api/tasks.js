// API route for tasks

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader("Access-Control-Allow-Credentials", true);
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version"
  );

  // Handle OPTIONS method (preflight requests)
  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  try {
    if (req.method === "GET") {
      // Return mock tasks or connect to your database here
      res.status(200).json([
        {
          id: "1",
          title: "Sample Task",
          description: "This is a sample task",
          completed: false,
        },
      ]);
    } else if (req.method === "POST") {
      // Parse the request body
      let taskData;
      try {
        // For string body
        if (typeof req.body === "string") {
          taskData = JSON.parse(req.body);
        }
        // For object body (already parsed)
        else if (req.body && typeof req.body === "object") {
          taskData = req.body;
        }
        // For empty body
        else {
          taskData = {};
        }
      } catch (e) {
        console.error("Error parsing request body:", e);
        return res.status(400).json({ error: "Invalid request body" });
      }

      console.log("Creating task:", taskData);

      // Here you would normally save to database
      // For now, mock a successful response
      res.status(201).json({
        id: Date.now().toString(),
        ...taskData,
        createdAt: new Date().toISOString(),
      });
    } else {
      // Method not allowed
      res.status(405).json({ error: "Method not allowed" });
    }
  } catch (error) {
    console.error("API error:", error);
    res
      .status(500)
      .json({ error: "Internal server error", details: error.message });
  }
}
