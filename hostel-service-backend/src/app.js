const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const connectDB = require('./config/db');

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Standard Middleware
app.use(helmet()); 
app.use(cors());
app.use(express.json());

// Basic Route for testing
app.get('/', (req, res) => res.send('VIT Hostel API is running...'));

// ... existing imports
const authRoutes = require('./routes/authRoutes');
const requestRoutes = require('./routes/requestRoutes');

// ... existing middleware
app.use('/api/auth', authRoutes);
app.use('/api/requests', requestRoutes);

// Error Handler
app.use((err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode).json({ message: err.message });
});



const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));