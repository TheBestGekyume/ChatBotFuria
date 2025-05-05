const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const serverless = require('serverless-http');

dotenv.config();

const app = express();

app.use(cors({
  origin: ['http://localhost:5173', 'http://192.168.0.4:5173', 'https://chatbot-furioso.netlify.app'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials:true
}));

const scraperRoutes = require('./routes/scraperRoutes');
const userRoutes = require('./routes/userRoutes');
const authRoutes = require('./routes/authRoutes');

app.use(express.json());

app.use('/api/scraper', scraperRoutes);
app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);

module.exports = serverless(app);
