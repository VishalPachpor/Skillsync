// Simple health check endpoint
export default function handler(req, res) {
  res.status(200).json({
    status: "ok",
    message: "SkillSync API is running",
    env: process.env.NODE_ENV || "development",
    timestamp: new Date().toISOString(),
  });
}
