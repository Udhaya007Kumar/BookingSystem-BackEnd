import { Router } from "express";
import { bookSlot, getBookings, cancelBooking } from "../controllers/booking.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const router = Router();

router.get("/", getBookings);
router.post("/", authMiddleware, bookSlot);
router.patch("/cancel/:bookingId", authMiddleware, cancelBooking);

export default router;
