const express = require('express');

const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware.js');

const Service = require('../models/serviceModel.js');

router.use(authMiddleware);
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

router.delete('/deleteService', async (req, res) => {
  try {
    const service = await Service.deleteOne({ user: req.userId });

    if (!service) {
      return res.status(400).send({ error: 'Erro interno em apagar serviço' });
    }

    return res.send({ ok: true });
  } catch (error) {
    return res.status(400).send({ error: 'Erro em apagar o serviço' });
  }
});

router.put('/updateService', async (req, res) => {
  try {
    const service = await Service.findOneAndUpdate({ user: req.userId }, req.body).populate('user');

    if (!service) {
      return res.status(400).send({ error: 'Erro interno em atualizar o serviço' });
    }
    return res.send({ service });
  } catch (error) {
    return res.status(400).send({ error: 'Erro em atualizar o serviço' });
  }
});

router.put('/ranked/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const service = await Service.findById(id).populate('user');
    service.comments.push({ ...req.body, author: req.userId });

    const ranks = service.comments.map(item => item.rank);
    const totalRank = ranks.reduce((a, b) => a + b, 0);

    service.rank = totalRank / service.comments.length;
    service.save();

    return res.send({ service });
  } catch (error) {
    return res.status(400).send({ error: 'Erro em rankear o serviço' });
  }
});

module.exports = app => app.use('/service', router);
