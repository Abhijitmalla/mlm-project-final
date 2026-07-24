import express from "express";
import {
    googleAuth,
    googleCallback
} from "../controllers/googleAuthController.js";

const router = express.Router();

router.get("/google/auth", googleAuth);

router.get("/oauth2callback", googleCallback);

export default router;