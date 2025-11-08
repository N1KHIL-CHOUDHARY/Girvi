// MongoDB connection logic
const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

mongoose.connect(process.env.MONGODB_URI);

console.log(`MongoDB Connected`);