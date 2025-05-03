const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors({
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials:true
}));

// Importe as rotas DEPOIS da configuração do CORS
const scraperRoutes = require('./routes/scraperRoutes');
const userRoutes = require('./routes/userRoutes');

app.use(express.json());

// Certifique-se que os paths estão corretos
app.use('/api/scraper', scraperRoutes);
app.use('/api/users', userRoutes);

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
