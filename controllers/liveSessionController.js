import db from "../config/db.js";
import { createGoogleMeetEvent, deleteGoogleCalendarEvent } from "../services/googleCalendarService.js";
import { google } from "googleapis";
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
    try {
        await query(`ALTER TABLE live_session_registrations ADD COLUMN preferred_slot VARCHAR(60) NULL`);
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
    const { name, mobile, email, message, razorpay_payment_id, razorpay_order_id, razorpay_payment_link_id, razorpay_payment_link_reference_id, razorpay_payment_link_status, razorpay_signature, amount, preferred_slot } = req.body;
    
    if (!name?.trim() || !/^\d{10}$/.test(String(mobile)) || !/^\S+@\S+\.\S+$/.test(email || "")) {
        return res.status(400).json({ success: false, message: "Please enter a valid name, 10-digit mobile number and email." });
    }

    if (!razorpay_payment_id || !razorpay_signature || (!razorpay_order_id && !razorpay_payment_link_id)) {
        return res.status(400).json({ success: false, message: "Payment details are missing." });
    }

    let body = "";
    if (razorpay_payment_link_id) {
        // Payment Link Signature format: payment_link_id|payment_link_reference_id|payment_link_status|payment_id
        body = `${razorpay_payment_link_id}|${razorpay_payment_link_reference_id || ''}|${razorpay_payment_link_status || ''}|${razorpay_payment_id}`;
    } else {
        // Order API Signature format: order_id|payment_id
        body = `${razorpay_order_id}|${razorpay_payment_id}`;
    }
    
    const expectedSignature = crypto.createHmac("sha256", process.env.RAZORPAY_SECRET)
        .update(body)
        .digest("hex");

    if (expectedSignature !== razorpay_signature) {
        return res.status(400).json({ success: false, message: "Invalid payment signature." });
    }

    // Prevent duplicate registration for same payment
    try {
        const existing = await query("SELECT id FROM live_session_registrations WHERE payment_id = ?", [razorpay_payment_id]);
        if (existing.length > 0) {
            return res.status(409).json({ success: false, message: "This payment has already been registered." });
        }
    } catch (_) {}

    try {
        const result = await query(
            "INSERT INTO live_session_registrations (name, mobile, email, message, amount, order_id, payment_id, preferred_slot) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
            [name.trim(), String(mobile), email.trim().toLowerCase(), message?.trim() || null, amount || 9, razorpay_order_id || razorpay_payment_link_id, razorpay_payment_id, preferred_slot?.trim() || null]
        );
        res.status(201).json({ success: true, message: "Registration received. Our team will contact you soon with the Google Meet link for your preferred slot.", registrationId: result.insertId });
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

// ── Reschedule: cancel old Google Calendar event, create a new one ──
export const rescheduleLiveSession = async (req, res) => {
    const { id } = req.params;
    const { scheduledAt, durationMinutes = 60 } = req.body;

    const start = new Date(scheduledAt);
    const duration = Number(durationMinutes);

    if (Number.isNaN(start.getTime()) || start <= new Date(Date.now() - 5 * 60000) || !Number.isFinite(duration) || duration < 15 || duration > 480) {
        return res.status(400).json({ success: false, message: "Choose a valid future time and a duration between 15 and 480 minutes." });
    }

    try {
        const registrations = await query("SELECT * FROM live_session_registrations WHERE id = ?", [id]);
        if (!registrations.length) return res.status(404).json({ success: false, message: "Registration not found." });

        const registration = registrations[0];

        // Delete old Google Calendar event if one exists
        if (registration.google_event_id) {
            await deleteGoogleCalendarEvent(registration.google_event_id);
        }

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

        res.json({
            success: true,
            message: "Session rescheduled. A new Google Meet invite has been emailed to the registrant.",
            meetingLink: meeting.meetLink
        });
    } catch (error) {
        console.error("Reschedule error:", error.message);
        res.status(500).json({ success: false, message: error.message || "Could not reschedule the session." });
    }
};

// ── Delete registration: cancel Google Calendar event + remove DB record ──
export const deleteRegistration = async (req, res) => {
    const { id } = req.params;

    try {
        const registrations = await query("SELECT * FROM live_session_registrations WHERE id = ?", [id]);
        if (!registrations.length) return res.status(404).json({ success: false, message: "Registration not found." });

        const registration = registrations[0];

        // Cancel the Google Calendar event if one exists
        if (registration.google_event_id) {
            await deleteGoogleCalendarEvent(registration.google_event_id);
        }

        await query("DELETE FROM live_session_registrations WHERE id = ?", [id]);

        res.json({ success: true, message: `Registration for ${registration.name} has been deleted.` });
    } catch (error) {
        console.error("Delete registration error:", error.message);
        res.status(500).json({ success: false, message: error.message || "Could not delete this registration." });
    }
};



// ── Send Meet Link Email: re-send the existing meeting link to the user via Gmail ──
export const sendMeetLinkEmail = async (req, res) => {
    const { id } = req.params;

    try {
        const registrations = await query("SELECT * FROM live_session_registrations WHERE id = ?", [id]);
        if (!registrations.length) return res.status(404).json({ success: false, message: "Registration not found." });

        const reg = registrations[0];

        if (!reg.meeting_link) {
            return res.status(400).json({ success: false, message: "No meeting link found. Please schedule the session first." });
        }

        // Build Gmail API client using existing OAuth2 credentials
        const oauth2Client = new google.auth.OAuth2(
            process.env.GOOGLE_CLIENT_ID,
            process.env.GOOGLE_CLIENT_SECRET,
            process.env.GOOGLE_REDIRECT_URI
        );
        oauth2Client.setCredentials({ refresh_token: process.env.GOOGLE_REFRESH_TOKEN });
        const gmail = google.gmail({ version: "v1", auth: oauth2Client });

        const sessionTime = reg.scheduled_at
            ? new Date(reg.scheduled_at).toLocaleString("en-IN", { dateStyle: "long", timeStyle: "short", timeZone: "Asia/Kolkata" })
            : "To be confirmed";

        const emailBody = [
            `To: ${reg.email}`,
            `Subject: Your Live Session Google Meet Link - VK Services Enterprise`,
            `MIME-Version: 1.0`,
            `Content-Type: text/html; charset=utf-8`,
            ``,
            `<!DOCTYPE html>`,
            `<html><body style="font-family:Inter,sans-serif;background:#f4f4f4;margin:0;padding:0;">`,
            `<div style="max-width:600px;margin:32px auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.08);">`,
            `  <div style="background:#065f46;padding:32px 36px;">`,
            `    <h1 style="color:#fff;margin:0;font-size:22px;font-weight:700;">Your Live Session is Scheduled! 🎉</h1>`,
            `    <p style="color:#a7f3d0;margin:8px 0 0;font-size:14px;">VK Services Enterprise — Private MLM Technology Brief</p>`,
            `  </div>`,
            `  <div style="padding:32px 36px;">`,
            `    <p style="color:#374151;font-size:15px;margin:0 0 24px;">Hi <strong>${reg.name}</strong>,</p>`,
            `    <p style="color:#374151;font-size:15px;margin:0 0 24px;">Your live 1-on-1 session has been scheduled. Here are your session details:</p>`,
            `    <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:20px 24px;margin:0 0 24px;">`,
            `      <p style="margin:0 0 10px;color:#065f46;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;">Session Details</p>`,
            `      <p style="margin:0 0 6px;color:#374151;font-size:14px;"><strong>Date &amp; Time:</strong> ${sessionTime} (IST)</p>`,
            `      <p style="margin:0 0 6px;color:#374151;font-size:14px;"><strong>Duration:</strong> 30 minutes</p>`,
            `      <p style="margin:0;color:#374151;font-size:14px;"><strong>Format:</strong> Google Meet (Video Call)</p>`,
            `    </div>`,
            `    <div style="text-align:center;margin:0 0 28px;">`,
            `      <a href="${reg.meeting_link}" style="display:inline-block;background:#065f46;color:#fff;font-weight:700;font-size:15px;padding:14px 36px;border-radius:8px;text-decoration:none;">`,
            `        📹 Join Google Meet`,
            `      </a>`,
            `      <p style="color:#6b7280;font-size:12px;margin:12px 0 0;">Or copy this link: <a href="${reg.meeting_link}" style="color:#065f46;">${reg.meeting_link}</a></p>`,
            `    </div>`,
            `    <p style="color:#6b7280;font-size:13px;border-top:1px solid #e5e7eb;padding-top:20px;margin:0;">`,
            `      After completing the session, your ₹9 booking fee will be <strong>100% refunded</strong> to your payment source.<br>`,
            `      If you need to reschedule, reply to this email or WhatsApp us at <strong>+91 89276 56368</strong>.`,
            `    </p>`,
            `  </div>`,
            `  <div style="background:#f9fafb;padding:16px 36px;border-top:1px solid #e5e7eb;">`,
            `    <p style="margin:0;color:#9ca3af;font-size:12px;text-align:center;">VK Services Enterprise &nbsp;|&nbsp; support@vkservicesenterprise.in</p>`,
            `  </div>`,
            `</div>`,
            `</body></html>`,
        ].join("\n");

        const encodedMessage = Buffer.from(emailBody).toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");

        await gmail.users.messages.send({
            userId: "me",
            requestBody: { raw: encodedMessage },
        });

        res.json({ success: true, message: `Google Meet link emailed to ${reg.email} successfully.` });
    } catch (error) {
        console.error("Send meet link email error:", error.message);
        res.status(500).json({ success: false, message: error.message || "Could not send the email." });
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