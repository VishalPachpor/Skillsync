import * as dotenv from "dotenv";
// Load environment variables from .env file
dotenv.config();

import express, { type Request, Response, NextFunction } from "express";
import session from "express-session";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";

declare module "express-session" {
  interface SessionData {
    userId: number | undefined;
  }
}

// For debugging
console.log("Environment variables:", {
  NODE_ENV: process.env.NODE_ENV,
  DATABASE_URL: process.env.DATABASE_URL ? "Set (masked for security)" : "Not set",
  SESSION_SECRET: process.env.SESSION_SECRET ? "Set (masked for security)" : "Not set",
});

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Add session middleware
app.use(
  session({
    secret: process.env.SESSION_SECRET || "your-secret-key",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
  })
);

// Development middleware for testing - automatically set userId
// This is required for development until we implement proper Firebase auth on the server
if (process.env.NODE_ENV !== "production") {
  app.use((req, _res, next) => {
    if (!req.session.userId) {
      req.session.userId = 1; // Use a dummy user ID for development
    }
    next();
  });
}

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error("Error:", err);
  res.status(500).json({ error: "Internal Server Error" });
});

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  try {
    const server = await registerRoutes(app);

    if (app.get("env") === "development") {
      await setupVite(app, server);
    } else {
      serveStatic(app);
    }

    const port = process.env.PORT ? parseInt(process.env.PORT) : 3000;
    server.listen(port, "localhost", () => {
      log(`Server started successfully on port ${port}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
})();
