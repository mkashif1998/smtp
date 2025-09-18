import express from "express";
import multer from "multer";
import sendEmail from "../utils/sendEmail.js";

const router = express.Router();

// Multer: keep file in memory (not saving on disk)
const storage = multer.memoryStorage();
const upload = multer({ storage });

// POST /api/payroll/send
router.post("/send", upload.single("pdfFile"), async (req, res) => {
  try {
    const { name, date, email } = req.body;   // employee info
    const pdfFile = req.file;                 // uploaded PDF

    if (!name || !date || !email || !pdfFile) {
      return res.status(400).json({ message: "Name, date, email, and PDF file are required" });
    }
    // Use shared mailer with template and attachment
    await sendEmail(
      email,
      `Payroll Slip - ${name} (${date})`,
      "payrollTemplate.html",
      { name, month: date },
      {
        from: process.env.EMAIL_USER,
        attachments: [
          {
            filename: `${name}_Payroll.pdf`,
            content: pdfFile.buffer,
            contentType: "application/pdf",
          },
        ],
      }
    );

    res.json({ message: "Payroll slip sent successfully ✅" });
  } catch (error) {
    console.error("Error sending payroll email:", error);
    res.status(500).json({ message: "Failed to send payroll email" });
  }
});

export default router;
