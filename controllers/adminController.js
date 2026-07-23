import db from "../config/db.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export const login = (req, res) => {

    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({
            success: false,
            message: "Email and Password are required"
        });
    }

    db.query(
        "SELECT * FROM admins WHERE email=?",
        [email],
        async (err, result) => {

            if (err) {
                return res.status(500).json({
                    success: false,
                    message: err.message
                });
            }

            if (result.length === 0) {
                return res.json({
                    success: false,
                    message: "Invalid Email"
                });
            }

            const admin = result[0];
console.log("Entered Password:", password);
console.log("Stored Hash:", admin.password);
            const match = await bcrypt.compare(password, admin.password);
console.log("Match:", match);
            if (!match) {
                return res.json({
                    success: false,
                    message: "Invalid Password"
                });
            }

            const token = jwt.sign(
                {
                    id: admin.id,
                    email: admin.email
                },
                process.env.JWT_SECRET,
                {
                    expiresIn: "1d"
                }
            );

            res.json({
                success: true,
                message: "Login Successful",
                token,
                admin: {
                    id: admin.id,
                    username: admin.username,
                    email: admin.email
                }
            });
        }
    );
};

export const changePassword = (req, res) => {
    const { oldPassword, newPassword, confirmPassword } = req.body;
    const adminId = req.admin.id;

    if (!oldPassword || !newPassword || !confirmPassword) {
        return res.status(400).json({
            success: false,
            message: "All fields are required"
        });
    }

    if (newPassword !== confirmPassword) {
        return res.status(400).json({
            success: false,
            message: "New password and confirm password do not match"
        });
    }

    db.query(
        "SELECT * FROM admins WHERE id=?",
        [adminId],
        async (err, result) => {
            if (err) {
                return res.status(500).json({
                    success: false,
                    message: err.message
                });
            }

            if (result.length === 0) {
                return res.json({
                    success: false,
                    message: "Admin not found"
                });
            }

            const admin = result[0];
            const match = await bcrypt.compare(oldPassword, admin.password);

            if (!match) {
                return res.json({
                    success: false,
                    message: "Incorrect old password"
                });
            }

            const hashedNewPassword = await bcrypt.hash(newPassword, 10);

            db.query(
                "UPDATE admins SET password=? WHERE id=?",
                [hashedNewPassword, adminId],
                (updateErr, updateResult) => {
                    if (updateErr) {
                        return res.status(500).json({
                            success: false,
                            message: updateErr.message
                        });
                    }

                    res.json({
                        success: true,
                        message: "Password changed successfully"
                    });
                }
            );
        }
    );
};