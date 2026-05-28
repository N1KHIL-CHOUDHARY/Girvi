const express = require('express');
const mongoose = require('mongoose');
const cron = require('node-cron');
const axios = require('axios');

const dotenv = require('dotenv');
dotenv.config();
const cors = require('cors');
const connectDB = require('./config/db');
const v1ApiRoutes = require('./routes/api/v1/index');
const errorHandler = require('./middlewares/errorHandler');
const { sendError } = require('./utils/response');

const app = express();
const PORT = process.env.PORT || 5000;

const allowedOrigins = [
  process.env.FRONTEND_URL
].filter(Boolean);



  app.use(
    cors({
      origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin)) return callback(null, true);
        return callback(new Error('Not allowed by CORS: ' + origin));
      },
      credentials: false,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    })
  );

app.options('*', cors());


app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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
  console.log("Allowed Origins:", allowedOrigins);
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
