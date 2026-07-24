import db from "../config/db.js";
import { createGoogleMeetEvent } from "../services/googleCalendarService.js";
import Razorpay from "razorpay";
import crypto from "crypto";

const query = (sql, values = []) => new Promise((resolve, reject) => {
    db.query(sql, values, (error, results) => error ? reject(error) : resolve(results));
});

export const initialiseLiveSessionTable = async () => {
    await query(`CREATE TABLE IF NOT EXISTS live_session_registrations (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(120) NOT NULL,
        mobile VARCHAR(20) NOT NULL,
        email VARCHAR(160) NOT NULL,
        message TEXT NULL,
        amount DECIMAL(10,2) DEFAULT 0,
        status ENUM('Pending','Scheduled') NOT NULL DEFAULT 'Pending',
        scheduled_at DATETIME NULL,
        meeting_link VARCHAR(500) NULL,
        google_event_id VARCHAR(255) NULL,
        order_id VARCHAR(255) NULL,
        payment_id VARCHAR(255) NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )`);
    try {
        await query(`ALTER TABLE live_session_registrations ADD COLUMN amount DECIMAL(10,2) DEFAULT 0`);
    } catch (e) {
        // column likely exists, ignore
    }
};

export const createOrder = async (req, res) => {
    try {
        const razorpay = new Razorpay({
            key_id: process.env.RAZORPAY_KEY,
            key_secret: process.env.RAZORPAY_SECRET
        });
        const options = {
            amount: 900, // Rs 9.00
            currency: "INR",
            receipt: `rcpt_live_${Date.now()}`
        };
        const order = await razorpay.orders.create(options);
        res.json({ success: true, orderId: order.id, amount: order.amount, key: process.env.RAZORPAY_KEY });
    } catch (error) {
        console.error("Error creating Razorpay order:", error);
        res.status(500).json({ success: false, message: "Could not initialize payment." });
    }
};

export const registerForLiveSession = async (req, res) => {
    const { name, mobile, email, message, razorpay_payment_id, razorpay_order_id, razorpay_signature, amount } = req.body;
    
    if (!name?.trim() || !/^\d{10}$/.test(String(mobile)) || !/^\S+@\S+\.\S+$/.test(email || "")) {
        return res.status(400).json({ success: false, message: "Please enter a valid name, 10-digit mobile number and email." });
    }

    if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
        return res.status(400).json({ success: false, message: "Payment details are missing." });
    }

    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto.createHmac("sha256", process.env.RAZORPAY_SECRET)
        .update(body.toString())
        .digest("hex");

    if (expectedSignature !== razorpay_signature) {
        return res.status(400).json({ success: false, message: "Invalid payment signature." });
    }

    try {
        const result = await query(
            "INSERT INTO live_session_registrations (name, mobile, email, message, amount, order_id, payment_id) VALUES (?, ?, ?, ?, ?, ?, ?)",
            [name.trim(), String(mobile), email.trim().toLowerCase(), message?.trim() || null, amount || 0, razorpay_order_id, razorpay_payment_id]
        );
        res.status(201).json({ success: true, message: "Registration received. We will email your Google Meet invite after the session is scheduled.", registrationId: result.insertId });
    } catch (error) {
        res.status(500).json({ success: false, message: "Could not save your registration." });
    }
};

export const getLiveSessionRegistrations = async (_req, res) => {
    try {
        const data = await query("SELECT * FROM live_session_registrations ORDER BY created_at DESC");
        res.json({ success: true, data });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const scheduleLiveSession = async (req, res) => {
    const { id } = req.params;
    const { scheduledAt, durationMinutes = 60 } = req.body;
    const start = new Date(scheduledAt);
    const duration = Number(durationMinutes);
    // Allow a 5-minute buffer for current-time selections and clock skew
    if (Number.isNaN(start.getTime()) || start <= new Date(Date.now() - 5 * 60000) || !Number.isFinite(duration) || duration < 15 || duration > 480) {
        return res.status(400).json({ success: false, message: "Choose a valid time and a duration between 15 and 480 minutes." });
    }
    try {
        const registrations = await query("SELECT * FROM live_session_registrations WHERE id = ?", [id]);
        if (!registrations.length) return res.status(404).json({ success: false, message: "Registration not found." });
        const registration = registrations[0];
        if (registration.status === "Scheduled") return res.status(409).json({ success: false, message: "This registration is already scheduled." });

        const end = new Date(start.getTime() + duration * 60 * 1000);
        const meeting = await createGoogleMeetEvent({
            name: registration.name,
            email: registration.email,
            startTime: start.toISOString(),
            endTime: end.toISOString()
        });
        await query(
            "UPDATE live_session_registrations SET status = 'Scheduled', scheduled_at = ?, meeting_link = ?, google_event_id = ? WHERE id = ?",
            [start, meeting.meetLink, meeting.eventId, id]
        );
        res.json({ success: true, message: "Google Meet link created and calendar invitation emailed.", meetingLink: meeting.meetLink });
    } catch (error) {
        console.error("Live session scheduling error:", error.message);
        res.status(500).json({ success: false, message: error.message || "Could not create the Google Meet invitation." });
    }
};


export const createGoogleMeetLink = async (req, res) => {
    const { id } = req.params;
    const { scheduledAt, durationMinutes = 60 } = req.body;

    try {
        const registrations = await query(
            "SELECT * FROM live_session_registrations WHERE id=?",
            [id]
        );

        if (!registrations.length) {
            return res.status(404).json({
                success: false,
                message: "Registration not found"
            });
        }

        const registration = registrations[0];

        const start = new Date(scheduledAt);
        const end = new Date(
            start.getTime() + durationMinutes * 60 * 1000
        );

        const meeting = await createGoogleMeetEvent({
            name: registration.name,
            email: registration.email,
            startTime: start.toISOString(),
            endTime: end.toISOString()
        });

        await query(
            `UPDATE live_session_registrations
             SET scheduled_at=?,
                 meeting_link=?,
                 google_event_id=?
             WHERE id=?`,
            [
                start,
                meeting.meetLink,
                meeting.eventId,
                id
            ]
        );

        res.json({
            success: true,
            meetLink: meeting.meetLink,
            eventId: meeting.eventId
        });

    } catch (err) {
        console.error(err);

        res.status(500).json({
            success: false,
            message: err.message
        });
    }
};