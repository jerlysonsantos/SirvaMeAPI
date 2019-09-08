const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/db_sirva', { useNewUrlParser: true, useFindAndModify: false, useCreateIndex: true });
mongoose.Promise = global.Promise;

module.exports = mongoose;
