const nodemailer = require("nodemailer");
const fs = require("fs");
const path = require("path");

const sendEmail = async (to, subject, templateName, replacements = {}) => {
  try {
    // 1. Load template file
    const templatePath = path.join(__dirname, "templates", templateName);
    let html = fs.readFileSync(templatePath, "utf8");

    // 2. Replace placeholders (like {{name}})
    for (const key in replacements) {
      html = html.replace(new RegExp(`{{${key}}}`, "g"), replacements[key]);
    }

    // 3. Configure transporter
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASSWORD,
      },
    });

    // 4. Send email
    await transporter.sendMail({
      from: `"Empello HRM" <${process.env.GMAIL_USER}>`,
      to,
      subject,
      html,
    });

    console.log("✅ Email sent to:", to);
  } catch (error) {
    console.error("❌ Error sending email:", error);
  }
};

module.exports = sendEmail;
