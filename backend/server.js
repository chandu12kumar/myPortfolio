const path = require("path");
const express = require("express");
const cors = require("cors");
const nodemailer = require("nodemailer");

// Load environment variables from .env (checks both root and local backend folder)
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });
require("dotenv").config({ path: path.resolve(__dirname, ".env") });
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS for frontend cross-origin requests
app.use(cors());
// Parse incoming JSON request bodies
app.use(express.json());

// Nodemailer SMTP Transporter Configuration
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: parseInt(process.env.SMTP_PORT || "587", 10),
  secure: process.env.SMTP_SECURE === "true", // true for 465, false for 587
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Verify the SMTP transporter connection configuration on server startup
if (process.env.SMTP_USER && process.env.SMTP_PASS) {
  transporter.verify((error, success) => {
    if (error) {
      console.error("❌ SMTP Transporter Verification Failed:", error.message);
    } else {
      console.log("✅ SMTP Transporter is Ready to Send Emails");
    }
  });
} else {
  console.warn("⚠️ SMTP credentials (SMTP_USER/SMTP_PASS) are missing in environment configuration.");
}

/**
 * POST /api/contact
 * Endpoint to receive contact form submissions and deliver them via email.
 */
app.post("/api/contact", async (req, res) => {
  const { Name, email, phone, City, message } = req.body;

  // Validate request parameters
  if (!Name || !email || !message) {
    return res.status(400).json({
      success: false,
      msg: "Missing required fields: Name, email, and message are required."
    });
  }

  // Ensure SMTP parameters are set before attempting to send
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.error("❌ Email transmission failed: SMTP credentials are not configured.");
    return res.status(500).json({
      success: false,
      msg: "Failed to send message."
    });
  }

  // Configure target receiver email
  const recipientEmail = process.env.SMTP_TO || process.env.SMTP_USER;

  // Email transmission options
  const mailOptions = {
    from: `"${Name} (via Portfolio)" <${process.env.SMTP_USER}>`,
    to: recipientEmail,
    replyTo: email, // Set visitor's email as the Reply-To address
    subject: `Portfolio Contact: Message from ${Name}`,
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 20px auto; padding: 0; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #7F1D1D, #FF3B3B); padding: 25px; text-align: center;">
          <h2 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 700; letter-spacing: 0.5px; text-transform: uppercase;">
            New Contact Message
          </h2>
        </div>
        
        <!-- Content Body -->
        <div style="padding: 30px; color: #334155;">
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 25px;">
            <tr style="border-bottom: 1px solid #f1f5f9;">
              <td style="padding: 12px 0; font-weight: 600; color: #475569; width: 30%; font-size: 15px;">Name:</td>
              <td style="padding: 12px 0; color: #0f172a; font-size: 15px;">${Name}</td>
            </tr>
            <tr style="border-bottom: 1px solid #f1f5f9;">
              <td style="padding: 12px 0; font-weight: 600; color: #475569; font-size: 15px;">Email:</td>
              <td style="padding: 12px 0; font-size: 15px;">
                <a href="mailto:${email}" style="color: #FF3B3B; text-decoration: none; font-weight: 500;">${email}</a>
              </td>
            </tr>
            <tr style="border-bottom: 1px solid #f1f5f9;">
              <td style="padding: 12px 0; font-weight: 600; color: #475569; font-size: 15px;">Phone Number:</td>
              <td style="padding: 12px 0; color: #0f172a; font-size: 15px;">${phone || "N/A"}</td>
            </tr>
            <tr style="border-bottom: 1px solid #f1f5f9;">
              <td style="padding: 12px 0; font-weight: 600; color: #475569; font-size: 15px;">City:</td>
              <td style="padding: 12px 0; color: #0f172a; font-size: 15px;">${City || "N/A"}</td>
            </tr>
          </table>
          
          <!-- Message Block -->
          <div style="padding: 20px; background-color: #f8fafc; border-left: 4px solid #7F1D1D; border-radius: 6px;">
            <h4 style="margin: 0 0 10px 0; color: #7F1D1D; font-size: 16px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Message:</h4>
            <p style="margin: 0; color: #1e293b; line-height: 1.6; font-size: 15px; white-space: pre-wrap;">${message}</p>
          </div>
        </div>
        
        <!-- Footer -->
        <div style="background-color: #f1f5f9; padding: 15px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0;">
          This contact request was securely sent from your personal Portfolio Website.
        </div>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    return res.json({
      success: true,
      msg: "Message Sent Successfully!",
    });
  } catch (err) {
    console.error("❌ Nodemailer sendMail error:", err);
    return res.status(500).json({
      success: false,
      msg: "Failed to send message.",
    });
  }
});

// Start Express Server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
