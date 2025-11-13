const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();
const cors = require('cors');
const connectDB = require('./config/db');
const v1ApiRoutes = require('./routes/api/v1/index');


const app = express();
const PORT = process.env.PORT || 5000;


app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
})); 

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/v1', v1ApiRoutes);

app.get('/', (req, res) => {
  res.send('PawnManager API is running...');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});