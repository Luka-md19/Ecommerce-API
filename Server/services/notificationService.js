// File Path: /services/notificationService.js

const sendEmail = require('../utils/email'); // Utility for sending emails
const orderStatusTemplates = require('../templates/orderStatusEmail'); // Email templates
const logger = require('../utils/logger'); // Centralized logger
const AppError = require('../utils/appError'); // Custom error class

/**
 * Sends an order-related notification email to the user based on the event.
 * @param {Object} order - The order object.
 * @param {String} event - The event type triggering the notification.
 */
const sendOrderNotification = async (order, event) => {
  try {
    // Validate user email
    if (!order.userId || !order.userId.email) {
      logger.error('User email not found, cannot send notification', { orderId: order._id });
      return;
    }

    logger.info('Sending notification', { event, orderId: order._id });

    // Retrieve the appropriate email template
    let template = orderStatusTemplates[event];

    // Use a default template if the specific one is not found
    if (!template) {
      logger.warn('No email template found for event, using default', { event });
      template = orderStatusTemplates.unknown;
    }

    // Generate email content using the template
    const emailOptions = template(order.userId, order);

    // Send the email using the sendEmail utility
    await sendEmail({
      to: order.userId.email,
      subject: emailOptions.subject,
      text: emailOptions.message,
    });

    logger.info('Email sent successfully', { event, email: order.userId.email });
  } catch (error) {
    logger.error('Failed to send email notification', {
      orderId: order._id,
      event,
      error: error.message,
    });
    // Optionally, you can throw an error or handle it as per your application's requirements
    // throw new AppError('Failed to send email notification', 500);
  }
};

/**
 * Notifies administrators about critical issues or important events.
 * @param {String} message - The message to be sent to administrators.
 */
const notifyAdmin = async (message) => {
  try {
    // Fetch admin emails from environment variables (comma-separated)
    const adminEmails = process.env.ADMIN_EMAILS ? process.env.ADMIN_EMAILS.split(',') : [];

    if (adminEmails.length === 0) {
      logger.warn('No admin emails configured, cannot send admin notification');
      return;
    }

    logger.info('Sending admin notification', { message, adminEmails });

    // Define the email options for admin notification
    const mailOptions = {
      to: adminEmails,
      subject: 'Admin Notification',
      text: message,
    };

    // Send the email using the sendEmail utility
    await sendEmail(mailOptions);

    logger.info('Admin notification email sent successfully', { adminEmails });
  } catch (error) {
    logger.error('Failed to send admin notification email', {
      message,
      error: error.message,
    });
    // Optionally, you can throw an error or handle it as per your application's requirements
    // throw new AppError('Failed to send admin notification email', 500);
  }
};

module.exports = {
  sendOrderNotification,
  notifyAdmin, // Exporting the notifyAdmin function
};
