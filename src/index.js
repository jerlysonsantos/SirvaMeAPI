require('dotenv').config();

const express = require('express');
const passport = require('passport');
const session = require('express-session');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();

// ================== Configurações do Socket.io ======================= //

const port = process.env.PORT || '3000';
const server = app.listen(port, () => console.log('Open Server'));
const io = require('socket.io').listen(server);

// ======================== Configurações Gerais ======================= //

app.use(cors({
  origin: "*",
  allowedHeaders: ['Content-Type', 'Authorization'],
  methods: "GET,PUT,POST,DELETE",
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(session({
  resave: false,
  saveUninitialized: true,
  secret: '8918c014d3fc7c0ad0721fe825371b76',
}));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// ==================================================================== //

require('./app/controllers/index.js')(app);
require('./app/middlewares/chatMiddleware')(io);
