const express = require('express');
const mongoose = require('mongoose');
const cron = require('node-cron');
const axios = require('axios');

const dotenv = require('dotenv');
dotenv.config();
const cors = require('cors');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');
const v1ApiRoutes = require('./routes/api/v1/index');
const errorHandler = require('./middlewares/errorHandler');
const { sendError } = require('./utils/response');

const app = express();
const PORT = process.env.PORT || 5000;

// CORS configuration - must allow credentials for cookies
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());


app.use('/api/v1', v1ApiRoutes);


app.get('/', (req, res) => {
  res.send('PawnManager API is running...');
});


app.use((req, res) => {
  return sendError(res, { status: 404, message: 'Route not found.' });
});


app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

cron.schedule("*/15 * * * *", async () => {
  try {
    const url = process.env.BACKEND_URL || `http://localhost:${PORT}`;
    await axios.get(url + "/");
    console.log("Pinged backend to keep it alive");
  } catch (error) {
    console.log("Ping failed:", error.message);
  }
});
