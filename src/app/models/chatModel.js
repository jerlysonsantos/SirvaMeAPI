/**
 * Modelo de chat
 */
const mongoose = require('../../database');

const chatSchema = new mongoose.Schema({

  room: {
    type: String,
    required: true,
  },

  providerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },

  clientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },

  messages: [{
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    message: {
      type: String,
      required: true,
    },
  }],
});

const Chat = mongoose.model('Chat', chatSchema);
module.exports = Chat;
