import express from "express";
import { login, changePassword } from "../controllers/adminController.js";
import { authenticateAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/login", login);
router.post("/change-password", authenticateAdmin, changePassword);

export default router;