/**
 * Controller para tratar tudo que envolver a conta do usuário
 * desde registro à esquecimento de senhas
 */

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

    // Verificar se existe o usuário
    const user = await User.findOne({ $or: [{ email: emailOrUser }, { username: emailOrUser }] })
      .select('+password');
    if (!user) {
      return res.status(400).send({ error: 'Usuario inexistente' });
    }

    // Compara senha para efetuar o login
    if (!await bcrypt.compare(password, user.password)) {
      return res.status(401).send({ error: 'Senha invalida' });
    }

    // Retorna as informações do usuario logado mais o token de sessão
    user.password = undefined;
    return res.send({ user, token: generateToken({ id: user.id }) });
  } catch (err) {
    return res.status(400).status({ error: 'Erro no login' });
  }
});

router.post('/register', async (req, res) => {
  try {
    const { username, email } = req.body;

    // Verifica se já existe o emal ou o nome de usuário
    const exist = await User.findOne({ $or: [{ email }, { username }] });
    if (exist) {
      return res.status(400).send({ error: 'Usuario já existente' });
    }

    const user = await User.create(req.body);

    // ============================= Parte de envio de email ==================== //

    const token = crypto.randomBytes(20).toString('hex'); // Cria um Token para o MAIL

    const type = 'Validar sua conta';
    const route = 'verify';

    // --------------Determina a validade do MAIL------------//
    const now = new Date();
    now.setHours(now.getHours() + 1);

    await User.findByIdAndUpdate(user.id, {
      $set: {
        passwordResetToken: token,
        passwordResetExpires: now,
      },
    });
    // -----------------------------------------------------//
    mailer.sendMail({

      to: email,
      from: 'no-reply-sirvame@gmail.com',
      subject: 'Verificação de Email no Sistema SirvaMe',
      template: 'mail',
      attachments: [{
        filename: 'sirvame.png',
        path: path.join(__dirname, '../../www/img/sirvame.png'),
        cid: 'logo@cid',
      }],
      context: {
        type,
        route,
        token,
        email,
      },

    }, (err) => {
      if (err) {
        return res.status(400).send({ error: 'Error no envio de email' });
      }
      return res.redirect('/');
    });
    // ------------------------------------------------------//

    // Retorna informações do usuário registrado para estabelecer sessão
    user.password = undefined;
    return res.send({ user, token: generateToken({ id: user.id }) });
  } catch (err) {
    return res.status(400).status({ error: 'Erro em registro de email' });
  }
});

// ==================================================================== //

// ============================ Esquecimento de senha ===================== //
router.post('/forgot_password', async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    // Verifica se usuário existe
    if (!user) {
      return res.status(400).send({ error: 'Usuario inexistente' });
    }

    // ============================= Parte de envio de email ==================== //

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
        filename: 'sirvame.png',
        path: path.join(__dirname, '../../www/img/sirvame.png'),
        cid: 'logo@cid',
      }],
      context: {
        type,
        route,
        token,
        email,
      },

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

    // Verficar se usuário existe
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

    // Atualiza o password
    user.password = password;
    await user.save();

    return res.status(200).send({ ok: true });
  } catch (err) {
    return res.status(400).send({ error: 'Erro no esqueci recuperar senha' });
  }
});
// ==========================================================================//

// ============================ Login Social =============================== //
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/google/callback', passport.authenticate('google', { failureRedirect: '/' }), (req, res) => {
  try {
    return res.send({ user: req.user });
  } catch (error) {
    return res.status(400).send({ error: 'Erro na authenticação por social' });
  }
});
// ========================================================================= //


module.exports = app => app.use('/auth', router);
