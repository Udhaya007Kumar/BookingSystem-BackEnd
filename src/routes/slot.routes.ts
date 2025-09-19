import { Router } from "express";
import { getSlots, createSlot, updateSlot, deleteSlot } from "../controllers/slot.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const router = Router();

router.get("/", getSlots);
router.post("/", authMiddleware, createSlot);
router.put("/:slotId", authMiddleware, updateSlot);
router.delete("/:slotId", authMiddleware, deleteSlot);

export default router;
