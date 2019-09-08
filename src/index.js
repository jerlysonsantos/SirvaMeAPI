const express = require('express');
const passport = require('passport');
const session = require('express-session');
const bodyParser = require('body-parser');

const app = express();

app.use(passport.initialize());
app.use(passport.session());
app.use(session({
  resave: false,
  saveUninitialized: true,
  secret: '8918c014d3fc7c0ad0721fe825371b76',
}));

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
