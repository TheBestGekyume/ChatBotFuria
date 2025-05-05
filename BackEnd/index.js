// const express = require('express');
// const cors = require('cors');
// const app = express();

// app.use(cors({
//   origin: ['http://localhost:5173', 'http://192.168.0.4:5173'],
//   methods: ['GET', 'POST', 'PUT', 'DELETE'],
//   allowedHeaders: ['Content-Type', 'Authorization'],
//   credentials:true
// }));

// const scraperRoutes = require('./routes/scraperRoutes');
// const userRoutes = require('./routes/userRoutes');
// const authRoutes = require('./routes/authRoutes');

// app.use(express.json());

// app.use('/api/scraper', scraperRoutes);
// app.use('/api/users', userRoutes);
// app.use('/api/auth', authRoutes);

// const PORT = 3000;
// app.listen(PORT, () => {
//   console.log(`Servidor rodando em http://localhost:${PORT}`);
// });








const express = require('express');
const path = require('path');
const cors = require('cors');
const app = express();
require('dotenv').config();


// Permitir CORS
app.use(cors({
  origin: ['http://localhost:5173', 'http://192.168.0.4:5173', 'https://chatbot-furioso.netlify.app'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials:true
}));

// Suas rotas de API
const scraperRoutes = require('./routes/scraperRoutes');
const userRoutes = require('./routes/userRoutes');
const authRoutes = require('./routes/authRoutes');

app.use(express.json());
app.use('/api/scraper', scraperRoutes);
app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);

// Servir os arquivos estáticos do React em produção
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../frontend/build')));

  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/build', 'index.html'));
  });
}


// Iniciar o servidor na porta 3000
const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});

