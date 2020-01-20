/**
 * Esse controller servirá de intermedio entre operações do usuario com o serviço.
 */

const express = require('express');

const router = express.Router();

const Service = require('../models/serviceModel.js');
const User = require('../models/userModel.js');
const authMiddleware = require('../middlewares/authMiddleware.js');

router.use(authMiddleware);

// ===================== Aceitação e Rejeição de Serviço ======================== //
router.get('/acceptService/:id', async (req, res) => {
  try {
    const { id } = req.params; // ID da lista de seviços para serem aceitos
    const provider = await User.findById(req.userId);

    if (!provider) {
      return res.status(400).send({ error: 'Usuário não existe' });
    }

    const providerLoc = provider.contractArea.toAcceptServices.map(e => e.id).indexOf(id);

    await User.findOneAndUpdate(
      {
        _id: provider.contractArea.toAcceptServices[providerLoc].client,
        'contractArea.contractedServices.service': provider.contractArea.toAcceptServices[providerLoc].service,
      },

      { $set: { 'contractArea.contractedServices.$.accepted': true } },
    );

    provider
      .contractArea.acceptedServices.push(provider.contractArea.toAcceptServices[providerLoc]);
    provider.contractArea.toAcceptServices.splice(providerLoc, 1);

    provider.save();

    /**
     * Aqui ficará o bloco de codigo para enviar uma noticação para o cliente
     * como? não sei, mas eu sei que vai ficar aqui
     */

    return res.send({ ok: 'Serviço aceito com sucesso' });
  } catch (error) {
    return res.status(400).send({ error: 'Erro em aceitar o serviço' });
  }
});
router.delete('/rejectService/:serviceId/:clientId', async (req, res) => {
  try {
    const { serviceId, clientId } = req.params; // ID da lista de seviços para serem aceitos

    const user = await User.findByIdAndUpdate(clientId,
      { $pull: { 'contractArea.contractedServices': { service: serviceId } } });

    const provider = await User.findByIdAndUpdate(req.userId ,
      { $pull: { 'contractArea.toAcceptServices': { service: serviceId }} });

    if (!user) {
      return res.status(400).send({ error: 'Usuário não existe' });
    }

    if (!provider) {
      return res.status(400).send({ error: 'Usuário não existe' });
    }

    return res.send({ ok: 'Serviço rejeitado com sucessor' });
  } catch (error) {
    console.log(error)
    return res.status(400).send({ error: 'Erro em rejeitar um serviço' });
  }
});
// ============================================================================== //

// ===================== Contrato e Cancelamento de Serviço ===================== //
router.post('/contractService/:id', async (req, res) => {
  try {
    const { id } = req.params; // ID do serviço requisitado
    const {
      address,
      location,
      date,
      extraInfo,
    } = req.body;

    const user = await User.findByIdAndUpdate(req.userId);

    const service = await Service.findById(id).populate('user');
    const provider = await User.findById(service.user.id);

    if (!user) {
      return res.status(400).send({ error: 'Usuário não existe' });
    }

    if (!service) {
      return res.status(400).send({ error: 'Serviço não existe' });
    }

    /**
     * Aqui ficará o bloco de codigo para enviar uma noticação para o prestador
     * como? não sei, mas eu sei que vai ficar aqui
     */

    user.contractArea.contractedServices.push({ ...req.body, service: id });
    provider.contractArea.toAcceptServices.push({
      service: id,
      location,
      address,
      extraInfo,
      date,
      client: req.userId,
    });
    user.save();
    provider.save();

    return res.send({ ok: 'Serviço contratado com sucesso\nAguarde a aceitação do prestador' });
  } catch (error) {
    return res.status(400).send({ error: 'Erro em contratar um serviço' });
  }
});
router.delete('/cancelService/:serviceId', async (req, res) => {
  try {
    const { serviceId } = req.params; // ID do serviço cancelado

    const user = await User.findByIdAndUpdate(req.userId,
      { $pull: { 'contractArea.contractedServices': { service: serviceId } } });

    const service = await Service.findById(serviceId).populate('user');
    const provider = await User.findByIdAndUpdate(service.user.id,
      { $pull: { 'contractArea.toAcceptServices': { client: user.id } } });

    if (!user) {
      return res.status(400).send({ error: 'Usuário não existe' });
    }

    if (!service) {
      return res.status(400).send({ error: 'Serviço não existe' });
    }

    if (!provider) {
      return res.status(400).send({ error: 'Prestador não existe' });
    }

    return res.send({ ok: 'Serviço Cancelado com sucesso' });
  } catch (error) {
    return res.status(400).send({ error: 'Erro em cancelar um serviço' });
  }
});
// ============================================================================== //

// ==================== Rankear e Comentar um Serviço especifico ================ //
router.put('/rankService/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const service = await Service.findById(id).populate('user');

    if (!service) {
      return res.status(400).send({ error: 'Serviço não existe' });
    }

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

// ====================== GET Services ======================= //

router.get('/getToAcceptServices', async (req, res) => {
  try {
    const services = await User.findById(req.userId)
      .populate('contractArea.toAcceptServices.service', 'name type description')
      .populate('contractArea.toAcceptServices.client', 'avatar name email');

    return res.send({ services: services.contractArea.toAcceptServices });
  } catch (error) {
    return res.status(400).send({ error: 'Erro em aceitar o serviço' });
  }
});

router.get('/getAcceptedServices', async (req, res) => {
  try {
    const services = await User.findById(req.userId)
      .populate('contractArea.acceptedServices.service', 'name type description')
      .populate('contractArea.acceptedServices.client', 'avatar name email');

    return res.send({ services: services.contractArea.acceptedServices });
  } catch (error) {
    return res.status(400).send({ error: 'Erro em aceitar o serviço' });
  }
});

router.get('/getContractedServices', async (req, res) => {
  try {
    const services = await User.findById(req.userId)
      .populate('contractArea.contractedServices.service', 'name type description');

    return res.send({ services: services.contractArea.contractedServices });
  } catch (error) {
    return res.status(400).send({ error: 'Erro em aceitar o serviço' });
  }
});

// ====================== GET Services ======================= //

module.exports = app => app.use('/operations', router);
