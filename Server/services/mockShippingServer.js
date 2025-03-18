// // File Path: /services/mockShippingServer.js

// const express = require('express');
// const axios = require('axios'); // For sending webhook events
// const crypto = require('crypto');
// const dotenv = require('dotenv');

// // Load environment variables from .env file
// dotenv.config({ path: './config.env' });

// const app = express();
// app.use(express.json());

// const shipments = {}; // Mock in-memory database for shipments

// // Endpoint to trigger shipment creation
// app.post('/shipping/create-shipment', (req, res) => {
//   const { orderId, type } = req.body; // Added 'type' to specify 'delivery' or 'return'

//   console.log('Received request to create shipment:', req.body);

//   if (!orderId || !type) {
//     console.log('Shipment creation failed: Order ID and type are required');
//     return res.status(400).json({ status: 'fail', message: 'Order ID and type are required' });
//   }

//   const trackingNumber = `TRACK-${Math.floor(Math.random() * 1000000)}`;
//   shipments[trackingNumber] = { orderId, status: 'pending', type };

//   console.log(`Shipment created with tracking number: ${trackingNumber}, status: pending`);

//   // Start simulating shipment progression
//   simulateShipmentProgression(trackingNumber);

//   return res.status(201).json({
//     status: 'success',
//     trackingNumber,
//   });
// });

// // Function to simulate shipment status progression and send webhooks
// function simulateShipmentProgression(trackingNumber) {
//   const shipment = shipments[trackingNumber];
//   if (!shipment) return;

//   let statuses;
//   if (shipment.type === 'delivery') {
//     statuses = ['pending', 'shipped', 'in_transit', 'out_for_delivery', 'delivered'];
//   } else if (shipment.type === 'return') {
//     statuses = ['return_initiated', 'courier_assigned', 'collected', 'returned_to_store'];
//   } else {
//     console.error(`Unhandled shipment type: ${shipment.type}`);
//     return;
//   }

//   let currentStatusIndex = statuses.indexOf(shipment.status);

//   const interval = setInterval(async () => {
//     if (currentStatusIndex < statuses.length - 1) {
//       currentStatusIndex++;
//       shipment.status = statuses[currentStatusIndex];

//       // Send webhook
//       try {
//         const payload = {
//           trackingNumber: trackingNumber,
//           status: shipment.status,
//           orderId: shipment.orderId,
//           type: shipment.type,
//         };

//         // Compute HMAC SHA256 signature with base64 encoding
//         const signature = crypto.createHmac('sha256', process.env.WEBHOOK_SECRET)
//                                 .update(JSON.stringify(payload))
//                                 .digest('base64');

//         console.log('Sending webhook with payload:', payload);

//         await axios.post(
//           'http://localhost:4000/webhooks/shipping',
//           payload,
//           {
//             headers: {
//               'Content-Type': 'application/json',
//               'x-webhook-signature': signature, // Correct header name and signature
//             },
//           }
//         );
//         console.log(`Webhook sent for shipment ${trackingNumber} with status: ${shipment.status}`);
//       } catch (error) {
//         console.error(`Failed to send webhook for shipment ${trackingNumber}: ${error.message}`);
//       }
//     } else {
//       clearInterval(interval); // Stop when shipment is delivered or returned_to_store
//       console.log(`Shipment ${trackingNumber} has reached final status: ${shipment.status}`);
//     }
//   }, 5000); // Update status every 5 seconds (adjust as needed)
// }

// // Start the mock shipping server on port 5001
// const port = 5001;
// app.listen(port, () => {
//   console.log(`Mock shipping API running on port ${port}`);
// });
