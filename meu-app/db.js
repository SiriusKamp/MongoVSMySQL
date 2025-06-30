const mongoose = require('mongoose');

async function connect() {
await mongoose.connect('mongodb://localhost:27017/loja_teste');
  console.log('✅ Conectado ao MongoDB Atlas');
}

module.exports = connect;
