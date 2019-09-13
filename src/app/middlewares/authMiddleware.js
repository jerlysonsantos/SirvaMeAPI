/**
 * Middleware para validar sessão
 * obs.: Tudos os controllers tem que passar pela verificação de sessão
 */

const jwt = require('jsonwebtoken');
const { secret } = require('../../config/secretToken.json');

module.exports = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).send({ error: 'Sem token enviado' });
  }

  const parts = authHeader.split(' ');

  if (!parts.length === 2) {
    return res.status(401).send({ error: 'Token error' });
  }

  const [scheme, token] = parts;

  if (!/^Bearrer$/i.test(scheme)) {
    return res.status(401).send({ error: 'Token malformatted' });
  }

  jwt.verify(token, secret, (err, decoded) => {
    if (err) {
      return res.status(401).send({ error: 'Invalid Token' });
    }

    req.userId = decoded.id;
    return next();
  });
};
