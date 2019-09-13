/**
 * Esse controller é um CRUD dos servivos e também há uma rota para commentarios
 */

const express = require('express');

const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware.js');

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
router.get('/getServices', async (req, res) => {
  try {
    const services = await Service.find({})
      .populate('user')
      .populate('comments.author');

    if (!services) {
      return res.status(400).send({ error: 'Não há serviços para mostrar' });
    }

    return res.send({ services });
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

module.exports = app => app.use('/service', router);
