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

  contacts: [{
    contactType: {
      type: String,
    },
    contact: {
      type: String,
    },
  }],

  prices: [{
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
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
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

const Service = mongoose.model('service', serviceSchema);
module.exports = Service;
