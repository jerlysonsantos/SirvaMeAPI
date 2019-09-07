const express = require('express');

const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware.js');

const Service = require('../models/serviceModel.js');

router.use(authMiddleware);
router.post('/create', async (req, res) => {
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

router.get('/getServices', async (req, res) => {
  try {
    const services = await Service.find({});

    if (!services) {
      return res.status(400).send({ error: 'Não há serviços para mostrarS' });
    }

    return res.send({ services });
  } catch (error) {
    return res.status(400).send({ error: 'Erro em pegar os Serviços' });
  }
});

module.exports = app => app.use('/service', router);
