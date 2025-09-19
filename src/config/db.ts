import mysql from "mysql2/promise";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";
dotenv.config();

const caPath = path.resolve(process.env.DB_CA_PATH || "");
if (!fs.existsSync(caPath)) {
  throw new Error(`CA certificate not found at ${caPath}`);
}

const caCert = fs.readFileSync(caPath);

export const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: Number(process.env.DB_PORT),
  ssl: {
    ca: caCert,
    rejectUnauthorized: true,
  },
});
