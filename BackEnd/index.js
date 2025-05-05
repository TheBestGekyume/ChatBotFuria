const express = require('express');
const serverless = require('serverless-http');
const cors = require('cors');
require('dotenv').config();

const app = express();

// CORS
app.use(cors({
  origin: ['http://localhost:5173', 'https://chatbot-furioso.netlify.app'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// Rotas
const scraperRoutes = require('./routes/scraperRoutes');
const userRoutes = require('./routes/userRoutes');
const authRoutes = require('./routes/authRoutes');

app.use(express.json());
app.use('/api/scraper', scraperRoutes);
app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);

// Exporte a função para o Vercel
module.exports = app;
module.exports.handler = serverless(app);
