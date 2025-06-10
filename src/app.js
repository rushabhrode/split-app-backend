// src/app.js
require('dotenv').config();
const express  = require('express');
const mongoose = require('mongoose');

const expenseRoutes    = require('./routes/expenses');
const settlementRoutes = require('./routes/settlements');

const app = express();
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  });

// Mount routers
app.use('/expenses', expenseRoutes);
app.use('/', settlementRoutes);   // serves /people, /balances, /settlements

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: 'Server error' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server listening on port ${PORT}`));
