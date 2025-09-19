import { Request, Response } from "express";
import { pool } from "../config/db";
import { hashPassword, comparePassword } from "../utils/hash.util";
import { generateToken } from "../utils/token.util";

export const signup = async (req: Request, res: Response) => {
  const { username, email, password, first_name, last_name } = req.body;
  console.log(username,email);
  
  try {
    const hashed = await hashPassword(password);
    const [result] = await pool.execute(
      `INSERT INTO users (username, email, password_hash, first_name, last_name) VALUES (?, ?, ?, ?, ?)`,
      [username, email, hashed, first_name, last_name]
    );
    const token = generateToken({ id: (result as any).insertId, username });
    res.status(201).json({ token });
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  try {
    const [rows] = await pool.execute(`SELECT * FROM users WHERE email = ?`, [email]);
    if ((rows as any).length === 0) return res.status(400).json({ message: "User not found" });

    const user = (rows as any)[0];
    const isMatch = await comparePassword(password, user.password_hash);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    const token = generateToken({ id: user.id, username: user.username });
    res.json({ token });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};
