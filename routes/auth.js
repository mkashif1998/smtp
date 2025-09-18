const express = require("express");
const sendEmail = require("../utils/sendEmail");
const router = express.Router();

// Temporary in-memory storage (⚠️ only for testing, use MongoDB in real app)
let otpStore = {};

// 1️⃣ Forgot Password → Generate & Send OTP
router.post("/forgot-password", async (req, res) => {
  try {
    const { email, name } = req.body;
    const otp = Math.floor(100000 + Math.random() * 900000); // 6-digit OTP

    // Save OTP in memory (valid for 10 mins)
    otpStore[email] = { otp, expiresAt: Date.now() + 10 * 60 * 1000 };

    // Send OTP Email
    await sendEmail(email, "Password Reset OTP", "otpTemplate.html", {
      name,
      otp,
    });

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

    if (!otpStore[email]) {
      return res.status(400).json({ message: "No OTP found. Please request again." });
    }

    const { otp: storedOtp, expiresAt } = otpStore[email];

    // Check expiry
    if (Date.now() > expiresAt) {
      delete otpStore[email];
      return res.status(400).json({ message: "OTP expired. Please request again." });
    }

    // Check match
    if (parseInt(otp) !== storedOtp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    // ✅ OTP correct → allow reset
    delete otpStore[email]; // clear used OTP
    res.json({ message: "OTP verified successfully. You can now reset your password." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error verifying OTP" });
  }
});

module.exports = router;
