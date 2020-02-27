/**
 * Modelo do Serviço
 */

const mongoose = require('../../database');
require('mongoose-double')(mongoose);

const SchemaTypes = mongoose.Schema.Types;

const serviceSchema = new mongoose.Schema({

  name: {
    type: String,
    required: true,
  },

  type: {
    type: String,
    required: true,
  },

  description: {
    type: String,
    required: false,
  },

  images: [{
    type: Buffer,
  }],

  contacts: [{
    _id: false,
    contactType: {
      type: String,
    },
    contact: {
      type: String,
    },
  }],

  availableDays: [{
    _id: false,
    weekDay: String,
    schedule: String,
  }],

  prices: [{
    _id: false,
    priceFor: {
      type: String,
    },
    price: {
      type: SchemaTypes.Double,
    },
  }],

  rank: {
    type: SchemaTypes.Double,
    default: 0.00,
  },

  comments: [{
    _id: false,
    comment: {
      type: String,
      required: true,
    },
    rank: {
      type: SchemaTypes.Double,
      required: true,
    },
  }],

  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },

  createAt: {
    type: Date,
    default: Date.now,
  },

});

const Service = mongoose.model('Service', serviceSchema);
module.exports = Service;
