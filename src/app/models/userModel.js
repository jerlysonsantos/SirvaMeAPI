const bcrypt = require('bcrypt');
const mongoose = require('../../database');

const userSchema = new mongoose.Schema({
  name: {
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

  password: {
    type: String,
    required: true,
    select: false,
  },

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
  bcrypt.hash(this.password, 10, (err, hash) => {
    if (err) {
      throw err;
    }
    this.password = hash;
    next();
  });
});
// ================================================================== //

const User = mongoose.model('User', userSchema);
module.exports = User;
