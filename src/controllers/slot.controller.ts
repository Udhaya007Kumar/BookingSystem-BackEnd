import { Request, Response } from "express";
import { pool } from "../config/db";

// 📌 Get all slots
export const getSlots = async (req: Request, res: Response) => {
  try {
    const [rows] = await pool.execute(
      `SELECT * FROM slots ORDER BY start_time ASC`
    );
    res.json(rows);
  } catch (err: any) {
    console.error("Error fetching slots:", err);
    res.status(500).json({ message: "Failed to fetch slots" });
  }
};

// 📌 Create new slot
export const createSlot = async (req: Request, res: Response) => {
  const { start_time, duration_minutes } = req.body;

  if (!start_time || !duration_minutes) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  try {
    const [result] = await pool.execute(
      `INSERT INTO slots (start_time, duration_minutes, is_available) VALUES (?, ?, 1)`,
      [start_time, duration_minutes]
    );

    const insertId = (result as any).insertId;
    const [rows]: any = await pool.execute(`SELECT * FROM slots WHERE id=?`, [
      insertId,
    ]);

    res.status(201).json(rows[0]);
  } catch (err: any) {
    console.error("Error creating slot:", err);
    res.status(400).json({ message: "Failed to create slot" });
  }
};

// 📌 Update slot
export const updateSlot = async (req: Request, res: Response) => {
  const { slotId } = req.params;
  const { start_time, duration_minutes, is_available } = req.body;

  try {
    const [result]: any = await pool.execute(
      `UPDATE slots 
       SET start_time=?, duration_minutes=?, is_available=?, updated_at=CURRENT_TIMESTAMP 
       WHERE id=?`,
      [start_time, duration_minutes, is_available ?? 1, slotId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Slot not found" });
    }

    const [rows]: any = await pool.execute(`SELECT * FROM slots WHERE id=?`, [
      slotId,
    ]);
    res.json(rows[0]);
  } catch (err: any) {
    console.error("Error updating slot:", err);
    res.status(400).json({ message: "Failed to update slot" });
  }
};

// 📌 Delete slot
export const deleteSlot = async (req: Request, res: Response) => {
  const { slotId } = req.params;
  try {
    const [result]: any = await pool.execute(`DELETE FROM slots WHERE id=?`, [
      slotId,
    ]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Slot not found" });
    }

    res.json({ message: "Slot deleted successfully", id: slotId });
  } catch (err: any) {
    console.error("Error deleting slot:", err);
    res.status(400).json({ message: "Failed to delete slot" });
  }
};
