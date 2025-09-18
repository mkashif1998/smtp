    const Otp = require("../models/Otp");
const transporter = require("../config/mailer");
const generateOTP = require("../utils/sendEmail");

// Forgot Password (send OTP)
exports.forgotPassword = async (req, res) => {
  const { email } = req.body;

  const otpCode = generateOTP();
  const expiry = Date.now() + 10 * 60 * 1000; // 10 min expiry

  await Otp.create({ email, otp: otpCode, expiresAt: expiry });

  await transporter.sendMail({
    from: `"Empello Support" <${process.env.GMAIL_USER}>`,
    to: email,
    subject: "Password Reset OTP",
    html: `<h3>Your OTP is: ${otpCode}</h3><p>Valid for 10 minutes.</p>`,
  });

  res.json({ message: "OTP sent to email" });
};

// Verify OTP
exports.verifyOtp = async (req, res) => {
  const { email, otp } = req.body;

  const otpRecord = await Otp.findOne({ email, otp });
  if (!otpRecord) return res.status(400).json({ message: "Invalid OTP" });

  if (otpRecord.expiresAt < Date.now()) {
    return res.status(400).json({ message: "OTP expired" });
  }

  res.json({ message: "OTP verified successfully" });
};
