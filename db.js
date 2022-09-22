const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  user: String,
  amount: Number,
});

mongoose.connect(process.env.DATABASE_URI)

module.exports = mongoose.model('Vote', schema);