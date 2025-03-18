// File: testShippoAxios.js

require('dotenv').config();
const axios = require('axios');

const SHIPPO_API_KEY = process.env.SHIPPO_API_KEY || 'shippo_test_36bd0cda7a3eb47e27664d855496e256e0e5d34c'; // Replace with your actual API key

const shipmentData = {
  address_from: {
    name: "Sender Name",
    street1: "123 Sender St",
    city: "Sender City",
    state: "CA",
    zip: "94105", // Valid ZIP Code
    country: "US",
  },
  address_to: {
    name: "Recipient Name",
    street1: "456 Recipient Ave",
    city: "Recipient City",
    state: "NY",
    zip: "10001", // Valid ZIP Code
    country: "US",
  },
  parcels: [{
    length: "5",
    width: "5",
    height: "5",
    distance_unit: "in",
    weight: "2",
    mass_unit: "lb",
  }],
  async: false,
};

axios.post('https://api.goshippo.com/shipments/', shipmentData, {
  headers: {
    'Authorization': `ShippoToken ${SHIPPO_API_KEY}`,
    'Content-Type': 'application/json',
  }
})
.then(response => {
  console.log('Shipment Created:', response.data);
})
.catch(error => {
  if (error.response) {
    console.error('Error Response Data:', JSON.stringify(error.response.data, null, 2));
  } else {
    console.error('Error Message:', error.message);
  }
});
