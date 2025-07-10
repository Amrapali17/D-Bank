const nodemailer = require('nodemailer');

const sendEmail = async (to, subject, html) => {
  try {
    // Ensure required environment variables are set
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      throw new Error('SMTP credentials are missing in environment variables');
    }

    // Create a transporter using Brevo SMTP settings
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp-relay.brevo.com',
      port: parseInt(process.env.SMTP_PORT, 10) || 587,
      secure: false, // Use STARTTLS (false for port 587)
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });

    const mailOptions = {
      from: `"BankDApp" <${process.env.SMTP_USER}>`,
      to,
      subject,
      html
    };

    // Send the email
    const info = await transporter.sendMail(mailOptions);
    console.log(`📨 Email successfully sent to ${to}. Message ID: ${info.messageId}`);
  } catch (error) {
    console.error('❌ Failed to send email:', error);
    throw error;
  }
};

module.exports = sendEmail;
