const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const auctionRoutes = require('./routes/auctionRoutes');
require('dotenv').config()
const app = express();

// Middleware
app.use(bodyParser.json());
// app.use(cors());

app.use(cors({
    origin: process.env.FRONTEND_SOCKET_URL, // Frontend URL
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization']
  }));

// Routes
app.get('/', (req, res)=> {
  console.log('Namaste India');
  res.send('Namaste India')
})
app.use('/auth', authRoutes);
app.use('/auction', auctionRoutes);

module.exports = app;
