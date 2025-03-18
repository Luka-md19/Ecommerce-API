const Address = require('../models/addressModel');

// Handle the default address logic (ensure only one default address per user)
const handleDefaultAddress = async (userId, isDefault) => {
  if (isDefault) {
    await Address.updateMany({ userId, isDefault: true }, { isDefault: false });
  }
};

// Export the utility function
module.exports = {
  handleDefaultAddress
};
