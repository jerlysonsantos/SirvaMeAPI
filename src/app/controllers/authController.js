const express = require('express');

const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const User = require('../models/userModel.js');
const { secret } = require('../../config/secretToken.json');

// =========================Gera Um token de Autenticação==================== //
function generateToken(params = {}) {
  return jwt.sign(params, secret, {
    expiresIn: 3600,
  });
}
// ========================================================================== //

router.post('/login', async (req, res) => {
  try {
    const { emailOrUser, password } = req.body;

    const user = await User.findOne({ $or: [{ email: emailOrUser }, { name: emailOrUser }] }).select('+password');

    if (!user) {
      return res.status(400).send({ error: 'Usuario inexistente' });
    }

    if (!await bcrypt.compare(password, user.password)) {
      return res.status(401).send({ error: 'Senha invalida' });
    }

    user.password = undefined;

    return res.send({ user, token: generateToken({ id: user.id }) });
  } catch (err) {
    return res.status(400).status({ error: 'Erro no login' });
  }
});

router.post('/register', async (req, res) => {
  try {
    const { name, email } = req.body;
    const exist = await User.findOne({ $or: [{ email }, { name }] });

    if (exist) {
      return res.status(400).send({ error: 'Usuario já existente' });
    }

    const user = await User.create(req.body);

    user.password = undefined;
    return res.send({ user });
  } catch (err) {
    return res.status(400).status({ error: 'Erro em registro de email' });
  }
});

module.exports = app => app.use('/auth', router);
