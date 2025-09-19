import app from "./app";
import { pool } from "./config/db";
import dotenv from "dotenv";
dotenv.config();

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    // Test DB connection before starting server
    const [rows] = await pool.query("SELECT NOW() AS currentTime");
    console.log("✅ DB Connected. Current Time:", rows);

    // Start server
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error("❌ DB Connection Failed:", err);
    process.exit(1); // exit if DB connection fails
  }
}

startServer();
