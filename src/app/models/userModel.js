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

  createAt: {
    type: Date,
    default: Date.now,
  },

});

// ========================= Encryptação de Senha =================== //
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

const User = mongoose.model('user', userSchema);
module.exports = User;
