/**
 * Modelo de grupos
 */
const mongoose = require('../../database');

const groupSchema = new mongoose.Schema({
  hashGroup: {
    type: String,
    require: true,
    unique: true,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  members: [{
    _id: false,
    memberId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    invitedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    }
  }]
});

const Group = mongoose.model('Group', groupSchema);
module.exports = Group;
