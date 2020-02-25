const Group = require('../models/groupModel.js');

exports.generateGroup = async (res, hashGroup, id) => {
  try {
    await Group.create({ hashGroup, createdBy: id });
    return res.send(hashGroup);
  } catch (error) {
    return res.status(400).send({ error: 'Erro em gerar um grupo' });
  }
};

exports.verifyGroupExist = async (res, hashGroup, id) => {
  try {
    const group = await Group.findOne({ $or: [{ hashGroup }, { createdBy: id }] }, (err, data) =>{
      if (err)
        return false;
    });

    if(!group)
      return false;

    return group;

  } catch (error) {
    return res.status(400).send({ error: 'Erro em verificar a existencia do grupo' });
  }

};
