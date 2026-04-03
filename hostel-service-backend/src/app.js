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
app.use(helmet({
  contentSecurityPolicy: process.env.NODE_ENV === 'production' ? undefined : false,
}));
const allowedOrigins = [
  'http://localhost:5173', // Your local React (Vite)
  'http://localhost:3000', // Traditional React
  'https://hostel-service-portal.vercel.app',// REPLACE THIS with your Vercel URL later
  'https://hostel-service-portal-1.onrender.com' 
];
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true
}));
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
