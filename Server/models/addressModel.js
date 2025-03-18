const mongoose = require('mongoose');
const { isDecimal } = require('validator');


const addressSchema = new mongoose.Schema({
    userId:{
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: [true,'Address must be belong to a user']
    },
    addressLine1 :{
        type: String,
        required: [true,'Address must have address line 1'],
        trim: true
    },
    addressLine2 :{
        type: String,
        trim: true
    },
    city:{
        type: String,
        required: [true,'Address must have a city'],
        trim: true
    },
    state:{
        type: String,
        required: [true,'Address must have a state'],
        trim: true
    },
    postalCode:{
        type: String,
        required: [true,'Address must have a postal code'],
        trim: true,
        validate: {
            validator:function(v){
                return/^[0-9]{5}(?:-[0-9]{4})?$/.test(v);
            },
            message : 'please enter a postal code'
        },
    },
    country:{
        type: String,
        required: [true,'Address must have a country'],
        trim: true
    },
    isDefault:{
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now,
      },
      updatedAt: {
        type: Date,
        default: Date.now,
      },
    });
    
    const Address = mongoose.model('Address', addressSchema);
    
    module.exports = Address;
    
