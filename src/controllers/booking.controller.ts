import { Request, Response } from "express";
import { pool } from "../config/db";

// 📌 Book slot
export const bookSlot = async (req: Request, res: Response) => {
  const { slot_id } = req.body;
  const user_id = (req as any).user.id; // from auth middleware

  try {
    // check availability
    const [slots] = await pool.execute(
      `SELECT * FROM slots WHERE id=? AND is_available=TRUE`,
      [slot_id]
    );
    if ((slots as any).length === 0) {
      return res.status(400).json({ message: "Slot not available" });
    }

    // insert booking
    const [result] = await pool.execute(
      `INSERT INTO bookings (user_id, slot_id, status) VALUES (?, ?, 'confirmed')`,
      [user_id, slot_id]
    );

    // mark slot unavailable
    await pool.execute(
      `UPDATE slots SET is_available=FALSE, updated_at=CURRENT_TIMESTAMP WHERE id=?`,
      [slot_id]
    );

    res.status(201).json({ bookingId: (result as any).insertId, slot_id });
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

// 📌 Get all bookings
export const getBookings = async (_req: Request, res: Response) => {
  try {
    const [rows] = await pool.execute(
      `SELECT b.id, u.username, u.email, s.start_time, s.duration_minutes, b.status
       FROM bookings b
       JOIN users u ON b.user_id = u.id
       JOIN slots s ON b.slot_id = s.id
       ORDER BY s.start_time ASC`
    );
    res.json(rows);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

// 📌 Cancel booking
export const cancelBooking = async (req: Request, res: Response) => {
  const { bookingId } = req.params;
  try {
    const [rows] = await pool.execute(`SELECT * FROM bookings WHERE id=?`, [bookingId]);
    if ((rows as any).length === 0) {
      return res.status(404).json({ message: "Booking not found" });
    }

    const booking = (rows as any)[0];
    await pool.execute(
      `UPDATE bookings SET status='cancelled', updated_at=CURRENT_TIMESTAMP WHERE id=?`,
      [bookingId]
    );
    await pool.execute(
      `UPDATE slots SET is_available=TRUE, updated_at=CURRENT_TIMESTAMP WHERE id=?`,
      [booking.slot_id]
    );

    res.json({ message: "Booking cancelled" });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};
