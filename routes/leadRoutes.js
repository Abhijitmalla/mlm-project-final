import express from "express";
import { convertToLead, getAllLeads, updateLeadStatus, updateLeadAmount,deleteLead,
    getArchivedLeads,deleteArchivedLead } from "../controllers/leadController.js";
import { authenticateAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/convert/:id", authenticateAdmin, convertToLead);
router.get("/all", authenticateAdmin, getAllLeads);
router.put("/status/:id", authenticateAdmin, updateLeadStatus);
router.put("/amount/:id", authenticateAdmin, updateLeadAmount);
router.delete("/delete/:id", authenticateAdmin, deleteLead);

router.get("/archive", authenticateAdmin, getArchivedLeads);
router.delete("/archive/delete/:id", authenticateAdmin, deleteArchivedLead);

export default router;
