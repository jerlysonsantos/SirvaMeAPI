/**
 * Modelo do usuário
 */

const bcrypt = require('bcrypt');
const mongoose = require('../../database');
require('mongoose-double')(mongoose);

const userSchema = new mongoose.Schema({

  avatar: {
    type: Buffer,
  },

  username: {
    type: String,
    require: true,
    unique: true,
  },

  email: {
    type: String,
    unique: true,
    require: true,
    lowercase: true,
  },

  name: {
    type: String,
    require: true,
  },

  password: {
    type: String,
    required: true,
    select: false,
  },

  contractedServices: [{
    service: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Service',
    },
    date: {
      type: Date,
    },
    extraInfo: {
      type: String,
    },
    accepted: {
      type: Boolean,
      default: false,
    },
  }],

  toAcceptServices: [{
    service: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Service',
    },
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    date: {
      type: Date,
    },
    extraInfo: {
      type: String,
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        required: true,
      },
      coordinates: {
        type: [Number],
        required: true,
      },
    },
  }],

  acceptedServices: [{
    service: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Service',
    },
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    date: {
      type: Date,
    },
    extraInfo: {
      type: String,
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        required: true,
      },
      coordinates: {
        type: [Number],
        required: true,
      },
    },
  }],

  passwordResetToken: {
    type: String,
    select: false,
  },

  passwordResetExpires: {
    type: Date,
    select: false,
  },

  verified: {
    type: Boolean,
    default: false,
  },

  createAt: {
    type: Date,
    default: Date.now,
  },

});

// ========================= Encryptação de Senha =================== //

// eslint-disable-next-line func-names
userSchema.pre('save', function (next) {
  if (this.password == null || this.password === undefined) {
    next();
  } else {
    bcrypt.hash(this.password, 10, (err, hash) => {
      if (err) {
        throw err;
      }
      this.password = hash;
      next();
    });
  }
});
// ================================================================== //

const User = mongoose.model('User', userSchema);
module.exports = User;
