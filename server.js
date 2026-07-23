import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

// console.log("DB_HOST:", process.env.DB_HOST);
// console.log("DB_USER:", process.env.DB_USER);
// console.log("DB_NAME:", process.env.DB_NAME);
// console.log("DB_PORT:", process.env.DB_PORT);
// console.log("PASSWORD LENGTH:", process.env.DB_PASSWORD?.length);

import db from "./config/db.js";
import enquiryRoutes from "./routes/enquiryRoutes.js";
import leadRoutes from "./routes/leadRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(
  cors({
    origin: [
      "http://127.0.0.1:5501",
      "http://localhost:5501",
      "http://localhost:5000",
      "http://127.0.0.1:5000",
      "http://127.0.0.1:5500",  
      "https://vkservicesenterprise.in",
      "https://www.vkservicesenterprise.in",
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    credentials: true,
  })
);app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Frontend files serve karega
app.use(express.static(path.join(__dirname, "public")));

// API Routes
app.use("/api/enquiry", enquiryRoutes);
app.use("/api/leads", leadRoutes);
app.use("/api/admin", adminRoutes);

// Homepage
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});