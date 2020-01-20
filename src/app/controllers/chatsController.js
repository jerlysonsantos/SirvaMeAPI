const express = require('express');
const generatePassword = require('password-generator');

const Chat = require('../models/chatModel.js');
const authMiddleware = require('../middlewares/authMiddleware.js');

const router = express.Router();

router.use(authMiddleware);

// ====================== Get Chats ======================= //
router.get('/getChats', async (req, res) => {
  try {
    const chats = await Chat.find({ providerId: req.userId })
      .populate('providerId')
      .populate('clientId');

    return res.send({ chats });
  } catch (error) {
    return res.status(400).send({ error: 'Erro em pegar Chats' });
  }
});
// ====================== Get Chats ======================= //

// ====================== Create Chat ======================= //
router.post('/createChat', async (req, res) => {
  try {
    const { providerId } = req.body;
    const chat = await Chat.create({
      room: generatePassword(),
      providerId,
      clientId: req.userId,
    });

    return res.send({ chat });
  } catch (error) {
    return res.status(400).send({ error: 'Error em criar um Chat' });
  }
});
// ====================== Create Chat ======================= //

// ====================== Delete Chat ======================= //
router.delete('/deleteChat/:room', async (req, res) => {
  try {
    const { room } = req.params;

    await Chat.findOneAndDelete({ room });

    return res.send({ ok: 'Chat apagado com sucesso' });
  } catch (error) {
    return res.status(400).send({ error: 'Erro em apagar um Chat' });
  }
});
// ====================== Delete Chat ======================= //

module.exports = app => app.use('/chats', router);
