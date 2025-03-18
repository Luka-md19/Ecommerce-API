const express = require('express');
const router = express.Router();
const webhookController = require('../controllers/webhookController');

// Route to handle Shippo webhooks
router.post('/shippo', webhookController.handleShippoWebhook);

module.exports = router;
