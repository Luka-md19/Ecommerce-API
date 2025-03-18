const nodemailer = require("nodemailer");

const sendEmail = async (options) => {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    const mailOptions = {
      from: `"Luka Store" <no-reply@lukastore.com>`,
      to: options.email,
      subject: options.subject,
      text: options.message, // Plain text
      html: options.html || null, // Optional HTML
    };

    // Send the email and log success
    await transporter.sendMail(mailOptions);
    console.log(`Email sent successfully to ${options.email} with subject: ${options.subject}`);
  } catch (error) {
    console.error("Error sending email:", error);
    throw new Error("Email could not be sent. Please try again later.");
  }
};

module.exports = sendEmail;
