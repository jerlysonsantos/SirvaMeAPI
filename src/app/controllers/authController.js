const express = require('express');

const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const path = require('path');
const crypto = require('crypto');
const passport = require('passport');

const User = require('../models/userModel.js');
const { secret } = require('../../config/secretToken.json');
const mailer = require('../../module/mailer.js');

// =========================Gera Um token de Autenticação==================== //
function generateToken(params = {}) {
  return jwt.sign(params, secret, {
    expiresIn: 3600,
  });
}
// ========================================================================== //

// ================================= LOGIN E CADASTRO ======================= //

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
    return res.send({ user, token: generateToken({ id: user.id }) });
  } catch (err) {
    return res.status(400).status({ error: 'Erro em registro de email' });
  }
});

// ==================================================================== //

// =============================Esquecimento de senha=======================//
router.post('/forgot_password', async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).send({ error: 'Usuario inexistente' });
    }

    const token = crypto.randomBytes(20).toString('hex'); // Cria um Token para o MAIL

    const type = 'Recuperar sua senha';
    const route = 'resetPass';

    // Determina a validade do MAIL
    const now = new Date();
    now.setHours(now.getHours() + 1);

    await User.findByIdAndUpdate(user.id, {
      $set: {
        passwordResetToken: token,
        passwordResetExpires: now,
      },
    });
    mailer.sendMail({
      to: email,
      from: 'no-reply-sirvame@gmail.com',
      subject: 'Esquecimento de Senha no Sistema SirvaMe',
      template: 'mail',
      attachments: [{
        filename: '2.png',
        path: path.join(__dirname, '../../www/img/sirvame.png'),
        cid: 'logo@cid',
      }],
      context: {
        type,
        route,
        token,
        email,
      }, // Coloca no email uma varivel

    }, (err) => {
      if (err) {
        return res.status(400).send({ err });
      }

      return res.status(200).send({ success: 'Email enviado com sucesso' });
    });
  } catch (err) {
    return res.status(400).send({ err });
  }
});
// ====================================================================== //

// =============================Reset de Senha=========================== //
router.post('/reset_password', async (req, res) => {
  try {
    const { email, token, password } = req.body;
    const user = await User.findOne({ email }).select('+passwordResetToken passwordResetExpires');

    if (!user) {
      return res.status(400).send({ error: 'Usuario inexistente' });
    }
    // Verifica a Validade do Token
    if (token !== user.passwordResetToken) {
      return res.status(400).send({ error: 'Token Invalido' });
    }

    // ---------------------Verifica se o Token expirou----------------//
    const now = new Date();
    if (now > user.passwordResetExpires) {
      return res.status(400).send({ error: 'Token Expirou' });
    }
    // ----------------------------------------------------------------//
    user.password = password;

    await user.save();

    return res.status(200).send({ ok: true });
  } catch (err) {
    return res.status(400).send({ error: 'Erro no esqueci recuperar senha' });
  }
});
// ==========================================================================//

router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/google/callback', passport.authenticate('google', { failureRedirect: '/' }), (req, res) => {
  try {
    return res.send({ user: req.user });
  } catch (error) {
    return res.status(400).send({ error: 'Erro na authenticação por social' });
  }
});
// ==========================================================================//


module.exports = app => app.use('/auth', router);
