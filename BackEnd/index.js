const express = require('express');
const cors = require('cors');

const lineupRoutes = require('./routes/scraperRoutes');
const userRoutes = require('./routes/userRoutes');

const app = express();
app.use(cors());
app.use(express.json()); // Para permitir o envio de JSON no corpo das requisições

// Rotas da API
app.use('/api/scraper', lineupRoutes);  // Rota de Scraper
app.use('/api/users', userRoutes);      // Rota de CRUD de Usuários

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
