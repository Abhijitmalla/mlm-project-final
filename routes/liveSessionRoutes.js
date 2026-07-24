import express from "express";
import { authenticateAdmin } from "../middleware/authMiddleware.js";
import { getLiveSessionRegistrations, registerForLiveSession, scheduleLiveSession, createOrder, createGoogleMeetLink } from "../controllers/liveSessionController.js";

const router = express.Router();
router.post("/create-order", createOrder);
router.post("/register", registerForLiveSession);
router.get("/registrations", authenticateAdmin, getLiveSessionRegistrations);
router.post("/registrations/:id/schedule", authenticateAdmin, scheduleLiveSession);
router.post(
    "/registrations/:id/create-meet",
    authenticateAdmin,
    createGoogleMeetLink
);

export default router;
