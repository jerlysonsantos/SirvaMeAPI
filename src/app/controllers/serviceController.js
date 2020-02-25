/**
 * Esse controller é um CRUD dos servivos e também há uma rota para commentarios
 */

const express = require('express');
const multiparty = require('multiparty');
const generatePassword = require('password-generator');

const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware.js');
const compress = require('../middlewares/compressMiddleware.js');
const group = require('../middlewares/groupMiddleware.js');

const Service = require('../models/serviceModel.js');

router.use(authMiddleware); // Middleware para validar sessão
// =============================== Criar Um novo serviço ========================= //
router.post('/createService', async (req, res) => {
  try {
    const service = await Service.create({ ...req.body, user: req.userId });

    if (!service) {
      return res.status(400).send({ error: 'Erro interno na criação do serviço' });
    }

    return res.send({ service });
  } catch (error) {
    return res.status(400).send({ error: 'Erro na criação do serviço' });
  }
});
// =============================================================================== //

// ============================== Retorna um serviço individual ================== //

router.get('/getService', async (req, res) => {
  try {
    const { id } = req.body;
    const service = await Service.findOne({ $or: [{ _id: id }, { user: req.userId }] }).populate('user');

    if (!service) {
      return res.status(400).send({ error: 'Não há serviços para mostrar' });
    }

    return res.send({ service });
  } catch (error) {
    return res.status(400).send({ error: 'Erro em pegar o serviço' });
  }
});
// =============================================================================== //

// ================================= Retorna todos os serviços =================== //
router.get('/getServices/:page', async (req, res) => {
  /**
   * Por padrão os serviços de maiores ranks vem primeiro
   */

  try {
    const { pages } = req.params;

    // Sistema de páginação de items
    const services = await Service.find({}, null, {
      skip: parseInt(pages, 10) === 1 ? 0 : pages * 10,
      limit: 10,
      sort: { rank: -1 },
    }).populate('user');

    if (!services) {
      return res.status(400).send({ error: 'Não há serviços para mostrar' });
    }

    return res.send({ services, pages });
  } catch (error) {
    return res.status(400).send({ error: 'Erro em pegar os Serviços' });
  }
});

// ========================== Apaga um serviço especifico ======================= //
router.delete('/deleteService/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const service = await Service.deleteOne({ $and: [{ user: req.userId }, { _id: id }] });

    if (!service) {
      return res.status(400).send({ error: 'Erro interno em apagar serviço' });
    }

    return res.send({ ok: true });
  } catch (error) {
    return res.status(400).send({ error: 'Erro em apagar o serviço' });
  }
});
// =============================================================================== //

// ============================ Atualiza um serviço especifico =================== //
router.put('/updateService/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const service = await Service.findOneAndUpdate({ $and: [{ user: req.userId }, { _id: id }] }, req.body).populate('user');

    if (!service) {
      return res.status(400).send({ error: 'Erro interno em atualizar o serviço' });
    }
    return res.send({ service });
  } catch (error) {
    return res.status(400).send({ error: 'Erro em atualizar o serviço' });
  }
});
// =============================================================================== //

// ====================== Upload Images ======================= //
router.post('/uploadImage', async (req, res) => {
  try {
    const form = new multiparty.Form();

    form.parse(req, async (err, fields, files) => {
      if (err) {
        return res.status(400).send({ error: 'Error em enviar a foto' });
      }
      if (!fields || !files) {
        return res.status(400).send({ error: 'Não há arquivos' });
      }

      const { images } = files;


      const compressedImages = await Promise.all(
        images.map(item => compress.compressImage(item, 1152, 768)),
      );

      const service = await Service.findOneAndUpdate({ user: req.userId },
        { $push: { images: compressedImages.forEach(item => item) } });
      return res.send({ service });
    });
  } catch (error) {
    return res.status(400).send({ error: 'Erro em enviar as imagens' });
  }
});
// ====================== Upload Images ======================= //

// ====================== Criar Grupo de Indicação ====================== //

router.get('/generateGroup', async (req, res) => {
  try {
    var randomLength = Math.floor(Math.random() * (30 - 20)) + 20;
    const service = await Service.findOne({ user: req.userId });
    const hashGroup = generatePassword(randomLength, false, /[\w\d\?\-]/);

    if(!service){
      return res.status(401).send({ error: 'Você não é um prestador' })
    }

    group.verifyGroupExist(res, hashGroup, req.userId)
      .then(response => {
        if(!response)
          return true;
        if(response.createdBy == req.userId) {
          return res.status(400).send({ error: 'Esse prestador já gerou um grupo de indicação' });
        }
        if(response.hashGroup === hashGroup) {
          group.generateGroup(res, generatePassword(randomLength, false, /[\w\d\?\-]/), req.userId);
        }
      });

    group.generateGroup(res, hashGroup, req.userId);
  } catch (error) {
    return res.status(400).send({ error: 'Erro na criação de serviço' });
  }
})

// ====================== Criar Serviço por Indicação ====================== //

// ====================== Criar Serviço por Indicação ====================== //

router.post('/createServiceByInvite', (req, res) => {
  try {
    const { hashGroup, invitedBy, ...camps } = req.body;
    group.verifyGroupExist(res, hashGroup)
      .then(async (response) => {
        if(!response)
          return res.status(400).send({ error: 'Grupo não existe' });
        const service = await Service.create({ ...camps, user: req.userId, group: { group: response._id, hashGroup, invitedBy }});

        if (!service) {
          return res.status(400).send({ error: 'Erro interno na criação do serviço' });
        }

        return res.send({ service });
      });
  } catch (error) {
    return res.status(400).send({ error: 'Erro na criação de serviço' });
  }
})

// ====================== Criar Serviço por Indicação ====================== //

module.exports = app => app.use('/service', router);
