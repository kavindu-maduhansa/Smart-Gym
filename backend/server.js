import express from 'express';
import connectDB from './db.js';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(express.json());

// Test route
app.get('/', (req, res) => {
  res.send('Smart Gym Backend is running 🏋️‍♂️');
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT} 🚀`));
