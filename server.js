require('dotenv').config();

const express = require('express');
const nodemailer = require('nodemailer');


const app = express();
const port = 5000;

// Middleware to parse JSON
app.use(express.json());  // No need for body-parser package anymore

// Route to send an email
app.post('/send-email', async (req, res) => {
  const { userName, userEmail, phNumber, purpose, date, callDuration, time, question, hostEmail } = req.body;

  if (!userName || !userEmail || !phNumber ||  !purpose || !date || !callDuration || !time || !question || !hostEmail) {
    return res.status(400).json({
      message: 'All fields are required: userName, phNumber, email, purpose, date, callDuration, time, and question.',
    });
  }

  // Configure the SMTP transporter
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465, 
    auth: {
      user: process.env.GMAIL_USER, 
      pass: process.env.GMAIL_PASSWORD,
    },
    debug: true,
    logger: true, 
  });

  // Email content
  const mailOptions = {
    from: `"Meeting Request" <${process.env.GMAIL_USER}>`, 
    to: `${hostEmail}`, 
    subject: 'New Meeting Request',
    html: `
      <h2>New Meeting Request</h2>
      <p><strong>User Name:</strong> ${userName}</p>
      <p><strong>Phone Number:</strong> ${phNumber}</p>
      <p><strong>Sender Email:</strong> ${userEmail}</p>
      <p><strong>Purpose:</strong> ${purpose}</p>
      <p><strong>Date:</strong> ${date}</p>
      <p><strong>Call Duration:</strong> ${callDuration}</p>
      <p><strong>Time:</strong> ${time}</p>
      <p><strong>Question:</strong> ${question}</p>
    `,
  };
  

  try {
    // Send email
    const info = await transporter.sendMail(mailOptions);
    res.status(200).json({
      message: 'Email sent successfully',
      info: info.response,
    });
  } catch (error) {
    console.error('Error sending email:', error);  // Log error to console for debugging
    res.status(500).json({
      message: 'Failed to send email',
      error: error.message,
    });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
