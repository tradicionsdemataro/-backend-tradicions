import "./config/env.js"; // 👈 AIXÒ HA D’ANAR PRIMER

import express from "express";
import cors from "cors";
import morgan from "morgan";
import dns from "dns";

import RouteEvents from "./routes/events.js";
import RoutePubli from "./routes/publi.js";
import RouteRese from "./routes/reseñas.js";
import RouteUsuari from "./routes/usuari.js";
import RouteProjecte from "./routes/projectes.js";
import RouteSoli from "./routes/solicituds.js";
import RouteAdmin from "./routes/admin.js";
import RouteMulti from "./routes/multimedia.js";

import { connectDB, closeDB } from "./config/mongodb.js";

const app = express();
dns.setDefaultResultOrder("ipv4first");
dns.setServers(["8.8.8.8", "1.1.1.1"]);
/**
 * =========================
 * CONFIG
 * =========================
 */
const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || "0.0.0.0";

/**
 * =========================
 * MIDDLEWARE
 * =========================
 */
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

/**
 * =========================
 * ROUTES BASE
 * =========================
 */
app.get("/", (req, res) => {
  res.status(200).json({
    message: "API running correctly 🚀",
    status: "ok",
    environment: process.env.NODE_ENV || "development",
  });
});

app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    database: "connected",
  });
});

/**
 * =========================
 * API ROUTES
 * =========================
 */
app.use("/events", RouteEvents);
app.use("/publi", RoutePubli);
app.use("/resenas", RouteRese);
app.use("/solicituds", RouteSoli)
app.use("/projectes", RouteProjecte);
app.use("/api/auth", RouteUsuari);
app.use("/admin", RouteAdmin);
app.use("/admin/multimedia", RouteMulti);
app.use("/uploads", express.static("uploads"));

/**
 * =========================
 * START SERVER
 * =========================
 */
let server;

const startServer = async () => {
  try {
    await connectDB();

    server = app.listen(PORT, HOST, () => {
      console.log(`\n🚀 Server running at: http://${HOST}:${PORT}`);
      console.log(
        `🧠 Environment: ${process.env.NODE_ENV || "development"}`
      );
      console.log("🍃 MongoDB Atlas connected\n");
    });
  } catch (error) {
    console.error("❌ Failed to start application:", error);
    process.exit(1);
  }
};

startServer();

/**
 * =========================
 * GRACEFUL SHUTDOWN
 * =========================
 */
const shutdown = async (signal) => {
  console.log(`\n⚠️ Received ${signal}. Closing server...`);

  try {
    if (server) {
      server.close(() => {
        console.log("🌐 HTTP server closed");
      });
    }

    await closeDB();

    console.log("✅ Shutdown completed");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error during shutdown:", error);
    process.exit(1);
  }
};

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

/**
 * =========================
 * ERROR HANDLING
 * =========================
 */
process.on("unhandledRejection", (err) => {
  console.error("🔥 Unhandled Rejection:", err);
});

process.on("uncaughtException", (err) => {
  console.error("💥 Uncaught Exception:", err);
  process.exit(1);
});