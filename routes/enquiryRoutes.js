import express from "express";
import {
    createEnquiry,
    getAllEnquiries,
    updateEnquiryStatus,
    getEnquiryStats,
    deleteEnquiry,
    getArchivedEnquiries
} from "../controllers/enquiryController.js";
import { authenticateAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/create", createEnquiry);
router.get("/all", authenticateAdmin, getAllEnquiries);
router.put(
    "/status/:id",
    authenticateAdmin,
    updateEnquiryStatus
);
router.get(
    "/stats",
    authenticateAdmin,
    getEnquiryStats
);
router.delete(
    "/delete/:id",
    authenticateAdmin,
    deleteEnquiry
);

router.get(
    "/archive",
    authenticateAdmin,
    getArchivedEnquiries
);
export default router;