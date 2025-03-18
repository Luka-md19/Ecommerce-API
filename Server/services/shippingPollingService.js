// // shippingPollingService.js

// const cron = require('node-cron');
// const axios = require('axios');
// const Shipping = require('../models/shippingModel');
// const Order = require('../models/orderModel');
// const notificationService = require('./notificationService');

// // Schedule the cron job to run every 3 seconds
// cron.schedule('*/3 * * * * *', async () => {
//   try {
//     const pendingShipments = await Shipping.find({
//       status: {
//         $in: [
//           'pending',
//           'shipped',
//           'in_transit',
//           'out_for_delivery',
//           'return_initiated',
//           'courier_assigned',
//           'collected',
//         ],
//       },
//     });
//     if (pendingShipments.length === 0) {
//       return;
//     }

//     for (const shipment of pendingShipments) {
//       try {
//         const response = await axios.get(
//           `http://localhost:5001/shipping/track/${shipment.trackingNumber}`
//         );
//         const mockStatus = response.data.status;

//         if (mockStatus !== shipment.status) {
//           shipment.status = mockStatus;
//           shipment.lastChecked = Date.now();
//           await shipment.save();

//           const order = await Order.findById(shipment.orderId).populate('userId');

//           // Handle status changes and send notifications
//           if (mockStatus === 'courier_assigned') {
//             await notificationService.sendOrderNotification(order, 'courier_assigned');
//             console.log(`Courier assigned notification sent for order ${order._id}`);
//           } else if (mockStatus === 'collected') {
//             await notificationService.sendOrderNotification(order, 'collected');
//             console.log(`Collected notification sent for order ${order._id}`);
//           } else if (mockStatus === 'returned_to_store') {
//             order.status = 'returned_to_store';
//             await order.save();
//             await notificationService.sendOrderNotification(order, 'returned_to_store');
//             console.log(`Returned to store notification sent for order ${order._id}`);
//           } else if (mockStatus === 'shipped') {
//             await notificationService.sendOrderNotification(order, 'shipped');
//             console.log(`Shipped notification sent for order ${order._id}`);
//           } else if (mockStatus === 'in_transit') {
//             await notificationService.sendOrderNotification(order, 'inTransit');
//             console.log(`In transit notification sent for order ${order._id}`);
//           } else if (mockStatus === 'out_for_delivery') {
//             await notificationService.sendOrderNotification(order, 'outForDelivery');
//             console.log(`Out for delivery notification sent for order ${order._id}`);
//           } else if (mockStatus === 'delivered') {
//             order.status = 'delivered';
//             await order.save();
//             await notificationService.sendOrderNotification(order, 'delivered');
//             console.log(`Delivered notification sent for order ${order._id}`);
//           }
//         }
//       } catch (error) {
//         console.error(`Error updating shipment ${shipment.trackingNumber}: ${error.message}`);
//       }
//     }
//   } catch (error) {
//     console.error('Error during shipment status update:', error.message);
//   }
// });
