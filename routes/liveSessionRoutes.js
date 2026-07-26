import express from "express";
import { authenticateAdmin } from "../middleware/authMiddleware.js";
import { getLiveSessionRegistrations, registerForLiveSession, scheduleLiveSession, createOrder, createGoogleMeetLink, rescheduleLiveSession, deleteRegistration } from "../controllers/liveSessionController.js";

const router = express.Router();
router.post("/create-order", createOrder);
router.post("/register", registerForLiveSession);
router.get("/registrations", authenticateAdmin, getLiveSessionRegistrations);
router.post("/registrations/:id/schedule", authenticateAdmin, scheduleLiveSession);
router.put("/registrations/:id/reschedule", authenticateAdmin, rescheduleLiveSession);
router.delete("/registrations/:id", authenticateAdmin, deleteRegistration);
router.post(
    "/registrations/:id/create-meet",
    authenticateAdmin,
    createGoogleMeetLink
);

export default router;
