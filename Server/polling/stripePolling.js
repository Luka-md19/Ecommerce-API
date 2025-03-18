const cron = require('node-cron');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const EventLog = require('../models/eventLogModel'); // Adjust the path as necessary
const { handlePaymentStatus, handleChargeUpdated, handleRefund } = require('../controllers/paymentController'); // Adjust the path as necessary
const logger = require('../utils/logger');

// Schedule a job every 5 minutes
cron.schedule('*/5 * * * *', async () => {
  logger.info('Polling Stripe for missed events...');
  try {
    // Retrieve the timestamp of the last processed event
    const lastEvent = await EventLog.findOne().sort({ createdAt: -1 });
    const lastTimestamp = lastEvent ? Math.floor(lastEvent.createdAt.getTime() / 1000) : 0;

    const events = await stripe.events.list({
      limit: 100,
      created: { gt: lastTimestamp },
    });

    logger.info(`Fetched ${events.data.length} events from Stripe`);

    for (const event of events.data) {
      try {
        await processStripeEvent(event);
      } catch (eventError) {
        logger.error(`Error processing event ${event.id}: ${eventError.message}`);
        // Optionally, implement retry logic or notify administrators
      }
    }
  } catch (error) {
    logger.error('Error polling Stripe events:', { error: error.message, stack: error.stack });
    // Optionally, implement alerting or retry mechanisms
  }
});

// Helper function to process events
async function processStripeEvent(event) {
  // Check if event already processed
  const exists = await EventLog.findOne({ eventId: event.id });
  if (exists) {
    logger.info(`Event already processed: ${event.id}`);
    return;
  }

  // Handle the event (reuse your webhook logic)
  switch (event.type) {
    case 'payment_intent.succeeded':
      await handlePaymentStatus(event.data.object, 'paid');
      break;
    case 'charge.updated':
      await handleChargeUpdated(event.data.object);
      break;
    case 'refund.succeeded':
      await handleRefund(event.data.object);
      break;
    // Handle other events as needed
    default:
      logger.warn(`Unhandled event type: ${event.type}`);
  }

  // Log the event as processed
  await EventLog.create({ eventId: event.id, createdAt: new Date(event.created * 1000) });
  logger.info(`Processed and logged event: ${event.id}`);
}
