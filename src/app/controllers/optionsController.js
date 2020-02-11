const express = require('express');
const multiparty = require('multiparty');

const router = express.Router();


const User = require('../models/userModel.js');
const compress = require('../middlewares/compressMiddleware.js');
const authMiddleware = require('../middlewares/authMiddleware.js');

router.use(authMiddleware);
// ====================== Avatar Upload ======================= //
router.post('/avatarUpload', async (req, res) => {
  try {
    const form = new multiparty.Form();

    form.parse(req, async (err, fields, files) => {
      if (err) {
        return res.status(400).send({ error: 'Error em enviar a foto' });
      }
      if (!fields || !files) {
        return res.status(400).send({ error: 'Não há arquivos' });
      }

      const { image } = files;

      compress.compressImage(image[0], 800, 600)
        .then(async (data) => {
          const user = await User.findByIdAndUpdate(req.userId, { avatar: data });
          return res.send({ user });
        });
    });
  } catch (error) {
    return res.status(400).send({ error: 'Erro em Adicionar um Avatar' });
  }
});
// ====================== Avatar Upload ======================= //

// ====================== Profile Edit =========================//

router.put('/updateProfile', async (req, res) => {
  try {

    const { name, email, password } = req.body;

    const user = await User.findById(req.userId).select('+password');    ;

    if (!user) {
      return res.status(400).send({ error: 'Usuário Inexistente' });
    }

    user.name = name;
    user.email = email;
    user.password = password;

    user.save();

    return res.send({ ok: 'Atualizado com Sucesso' });

  } catch (error) {
    return res.status(400).send({ error: 'Erro em Atualizar o perfil' });
  }
});

// ====================== Profile Edit =========================//


module.exports = app => app.use('/options', router);
