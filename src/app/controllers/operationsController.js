/**
 * Esse controller servirá de intermedio entre operações do usuario com o serviço.
 */

const express = require('express');

const router = express.Router();

const Service = require('../models/serviceModel.js');
const authMiddleware = require('../middlewares/authMiddleware.js');

router.use(authMiddleware);
// ===================== Rankear e Comentar um Serviço especifico =============== //
router.put('/rankService/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const service = await Service.findById(id).populate('user');
    service.comments.push({ ...req.body, author: req.userId });

    const ranks = service.comments.map(item => item.rank);
    const totalRank = ranks.reduce((a, b) => a + b, 0);

    service.rank = totalRank / service.comments.length;
    service.save();

    return res.send({ ok: 'Comentario feito com sucesso' });
  } catch (error) {
    return res.status(400).send({ error: 'Erro em rankear o serviço' });
  }
});
// ============================================================================== //

module.exports = app => app.use('/operations', router);
