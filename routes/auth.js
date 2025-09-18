const express = require("express");
const sendEmail = require("../utils/sendEmail");
const Otp = require("../models/Otp");
const router = express.Router();

// 1️⃣ Forgot Password → Generate & Send OTP
router.post("/forgot-password", async (req, res) => {
  try {
    const { email, name } = req.body;
    const otp = Math.floor(100000 + Math.random() * 900000); // 6-digit OTP

    // Send OTP Email
    await sendEmail(email, "Password Reset OTP", "otpTemplate.html", {
      name,
      otp,
    });

    // Save OTP to DB with 10-minute expiry (upsert per email)
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    await Otp.findOneAndUpdate(
      { email },
      { email, otp: String(otp), expiresAt },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    res.json({ message: "OTP sent to email" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error sending OTP" });
  }
});

// 2️⃣ Verify OTP
router.post("/verify-otp", async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: "Email and OTP are required" });
    }

    const record = await Otp.findOne({ email, otp: String(otp) });

    if (!record) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    if (record.expiresAt < new Date()) {
      // Clean up expired record
      await Otp.deleteOne({ _id: record._id });
      return res.status(400).json({ message: "OTP expired" });
    }

    // OTP is valid – delete to prevent reuse
    await Otp.deleteOne({ _id: record._id });

    return res.json({ message: "OTP verified successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error verifying OTP" });
  }
});

module.exports = router;
