const cron = require('node-cron');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Schedule a job every 5 minutes
cron.schedule('*/5 * * * *', async () => {
  console.log('Polling Stripe for missed events...');
  try {
    // Retrieve the timestamp of the last processed event
    const lastEvent = await EventLog.findOne().sort({ createdAt: -1 });
    const lastTimestamp = lastEvent ? lastEvent.createdAt.getTime() / 1000 : undefined;

    const events = await stripe.events.list({
      limit: 100,
      created: { gt: lastTimestamp },
    });

    for (const event of events.data) {
      // Process each event using your existing webhook handler
      await processStripeEvent(event);
    }
  } catch (error) {
    console.error('Error polling Stripe events:', error);
  }
});

// Helper function to process events
async function processStripeEvent(event) {
  // Check if event already processed
  const exists = await EventLog.findOne({ eventId: event.id });
  if (exists) return;

  // Handle the event (reuse your webhook logic)
  switch (event.type) {
    case 'payment_intent.succeeded':
      await handlePaymentStatus(event.data.object, 'paid');
      break;
    // Handle other events...
    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  // Log the event as processed
  await EventLog.create({ eventId: event.id, createdAt: new Date(event.created * 1000) });
}
