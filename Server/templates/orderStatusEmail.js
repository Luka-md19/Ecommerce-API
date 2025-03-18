// File Path: /templates/orderStatusEmail.js

const orderStatusTemplates = {
  pending: (user, order) => ({
    subject: `Your Order #${order._id} is Confirmed!`,
    message: `Hi ${user.firstName},\n\nThank you for your purchase! We’ve received your order (#${order._id}) and it is currently being prepared. We’ll let you know once it’s ready to ship.\n\nThanks for shopping with us!\nBest regards,\nThe Luka Store Team`,
  }),
  payment_intent_created: (user, order) => ({
    subject: `Your Order #${order._id} Payment Initiated!`,
    message: `Hi ${user.firstName},\n\nYour payment for order (#${order._id}) has been initiated. Please complete the payment to proceed with your order.\n\nThank you for shopping with us!\nBest regards,\nThe Luka Store Team`,
  }),
  payment_successful: (user, order) => ({
    subject: `Payment Successful for Order #${order._id}!`,
    message: `Hi ${user.firstName},\n\nYour payment for order (#${order._id}) was successful. We’re now preparing your order for shipment.\n\nThank you for shopping with us!\nBest regards,\nThe Luka Store Team`,
  }),
  processing: (user, order) => ({
    subject: 'Your Order is Being Processed',
    message: `Hi ${user.firstName},\n\nYour order (#${order._id}) is being processed. We’ll notify you once it’s shipped.\n\nBest regards,\nThe Luka Store Team`,
  }),
  shipped: (user, order) => ({
    subject: `Your Order #${order._id} Has Been Shipped!`,
    message: `Hi ${user.firstName},\n\nYour order (#${order._id}) has been shipped and is on its way to the courier. We’ll notify you once it's in transit.\n\nThank you for shopping with us!\nBest regards,\nThe Luka Store Team`,
  }),
  in_transit: (user, order) => ({
    subject: `Your Order #${order._id} is In Transit!`,
    message: `Hi ${user.firstName},\n\nYour order (#${order._id}) is on its way and is currently in transit! We’ll notify you once it's closer to delivery.\n\nThank you for shopping with us!\nBest regards,\nThe Luka Store Team`,
  }),
  out_for_delivery: (user, order) => ({
    subject: `Your Order #${order._id} is Out for Delivery!`,
    message: `Hi ${user.firstName},\n\nYour order (#${order._id}) is out for delivery and will arrive soon! Please make sure someone is available to receive the package.\n\nThank you for shopping with us!\nBest regards,\nThe Luka Store Team`,
  }),
  delivered: (user, order) => ({
    subject: `Your Order #${order._id} Has Been Delivered!`,
    message: `Hi ${user.firstName},\n\nYour order (#${order._id}) has been delivered. We hope you enjoy your purchase!\n\nThank you for shopping with us!\nBest regards,\nThe Luka Store Team`,
  }),
  return_initiated: (user, order) => ({
    subject: `Return Initiated for Order #${order._id}`,
    message: `Hi ${user.firstName},\n\nWe have initiated the return process for your order (#${order._id}). A courier will be assigned shortly to collect the items from your address.\n\nBest regards,\nThe Luka Store Team`,
  }),
  courier_assigned: (user, order) => ({
    subject: `Courier Assigned for Return of Order #${order._id}`,
    message: `Hi ${user.firstName},\n\nA courier has been assigned to collect your return for order (#${order._id}). We will notify you once the courier collects the package.\n\nBest regards,\nThe Luka Store Team`,
  }),
  collected: (user, order) => ({
    subject: `Return Package Collected for Order #${order._id}`,
    message: `Hi ${user.firstName},\n\nYour return package for order (#${order._id}) has been collected by the courier and is on its way back to our store.\n\nBest regards,\nThe Luka Store Team`,
  }),
  returned_to_store: (user, order) => ({
    subject: `Return Received for Order #${order._id}`,
    message: `Hi ${user.firstName},\n\nWe have received your returned items for order (#${order._id}). We will process your refund shortly.\n\nBest regards,\nThe Luka Store Team`,
  }),
  refund_completed: (user, order) => ({
    subject: `Refund Completed for Order #${order._id}`,
    message: `Hi ${user.firstName},\n\nYour refund for order (#${order._id}) has been processed successfully. The amount should now be reflected in your account.\n\nBest regards,\nThe Luka Store Team`,
  }),
  shipment_pending: (user, order) => ({
    subject: `Shipment Pending for Your Order #${order._id}`,
    message: `Hi ${user.firstName},\n\nYour shipment for order (#${order._id}) is pending due to no available couriers. We are working to resolve this issue and will notify you once the shipment is assigned.\n\nBest regards,\nThe Luka Store Team`,
  }),
  unknown: () => ({
    subject: 'Order Status Update',
    message: 'Your order status has been updated.',
  }),
};

module.exports = orderStatusTemplates;
