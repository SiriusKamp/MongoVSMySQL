const express = require('express');
const connect = require('./db');
const path = require('path');
const mongoose = require('mongoose');

const app = express();
app.use(express.json());
app.use(express.static('public'));

// Forçar nomes das collections como 'clientes', 'produtos', 'vendas'
const clienteSchema = new mongoose.Schema({ nome: String });
const produtoSchema = new mongoose.Schema({ nome: String, preco: Number });
const vendaSchema = new mongoose.Schema({
  cliente_id: mongoose.Schema.Types.ObjectId,
  produto_id: mongoose.Schema.Types.ObjectId,
  data_venda: Date,
  quantidade: Number
});

const Cliente = mongoose.model('Cliente', clienteSchema, 'clientes');
const Produto = mongoose.model('Produto', produtoSchema, 'produtos');
const Venda = mongoose.model('Venda', vendaSchema, 'vendas');

// Inserir clientes e produtos
app.post('/inserir-clientes-produtos', async (req, res) => {
  const inicio = Date.now();

  const clientes = [], produtos = [];
  for (let i = 1; i <= 10000; i++) {
    clientes.push({ nome: `Cliente ${i}` });
    produtos.push({ nome: `Produto ${i}`, preco: Math.floor(Math.random() * 1000) });
  }
  await Cliente.insertMany(clientes);
  await Produto.insertMany(produtos);

  const fim = Date.now();
  console.log(`⏱️ Tempo inserção clientes/produtos: ${(fim - inicio) / 1000}s`);
  res.send('✅ Clientes e produtos inseridos');
});

// Inserir vendas
app.post('/inserir-vendas', async (req, res) => {
  const inicio = Date.now();

  const clientes = await Cliente.find();
  const produtos = await Produto.find();
  const vendas = [];

  for (let i = 0; i < 500000; i++) {
    const cliente = clientes[Math.floor(Math.random() * clientes.length)];
    const produto = produtos[Math.floor(Math.random() * produtos.length)];
    vendas.push({
      cliente_id: cliente._id,
      produto_id: produto._id,
      data_venda: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000),
      quantidade: Math.floor(Math.random() * 10 + 1)
    });
  }

  await Venda.insertMany(vendas);

  const fim = Date.now();
  console.log(`⏱️ Tempo inserção vendas: ${(fim - inicio) / 1000}s`);
  res.send('✅ 500.000 vendas inseridas');
});

// Listar todas as vendas (sem join)
app.get('/listar-vendas', async (req, res) => {
  const inicio = Date.now();
  const vendas = await Venda.find();
  const fim = Date.now();
  console.log(`⏱️ Tempo listagem vendas: ${(fim - inicio) / 1000}s`);
  res.json(vendas);
});

// Listar detalhes com join (aggregate + $lookup)
app.get('/listar-detalhes-vendas', async (req, res) => {
  try {
    const inicio = Date.now();

    const detalhes = await Venda.aggregate([
      {
        $lookup: {
          from: 'clientes',
          localField: 'cliente_id',
          foreignField: '_id',
          as: 'cliente'
        }
      },
      { $unwind: '$cliente' },
      {
        $lookup: {
          from: 'produtos',
          localField: 'produto_id',
          foreignField: '_id',
          as: 'produto'
        }
      },
      { $unwind: '$produto' },
      {
        $project: {
          _id: 0,
          cliente: '$cliente.nome',
          produto: '$produto.nome',
          valor: '$produto.preco',
          quantidade: 1,
          data_venda: 1
        }
      },
    ]);

    const fim = Date.now();
    console.log(`⏱️ Tempo listagem detalhes vendas: ${(fim - inicio) / 1000}s`);
    if (detalhes.length > 0) {
      console.log('🧪 Exemplo de venda detalhada:', JSON.stringify(detalhes[0], null, 2));
    } else {
      console.log('⚠️ Nenhum detalhe retornado!');
    }

    res.json(detalhes);
  } catch (err) {
    console.error('❌ Erro na agregação:', err);
    res.status(500).json({ erro: 'Erro ao buscar detalhes das vendas' });
  }
});

connect().then(() => {
  app.listen(3000, () => console.log('🚀 Servidor rodando em http://localhost:3000'));
});
