const express = require('express');
const bodyParser = require('body-parser');

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.get('/', (req, res) => {
  return res.end('Servidor Aberto');
});

function normalizePort(val) {
  const ports = parseInt(val, 10);

  // eslint-disable-next-line no-restricted-globals
  if (isNaN(ports)) {
    return val;
  }
  if (ports >= 0) {
    return ports;
  }
  return false;
}

const port = normalizePort(process.env.PORT || '3000');

require('./app/controllers/index.js')(app);

app.listen(port, () => {
  console.log('Start Server');
});
