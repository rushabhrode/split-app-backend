// src/models/Expense.js
const mongoose = require('mongoose');

const ShareSchema = new mongoose.Schema({
  person:  { type: String, required: true, trim: true },
  type:    { type: String, enum: ['equal','percentage','exact'], default: 'equal' },
  value:   { type: Number, default: null, min: 0 }
});

const ExpenseSchema = new mongoose.Schema({
  amount:      { type: Number, required: true, min: 0.01 },
  description: { type: String, required: true, trim: true },
  paid_by:     { type: String, required: true, trim: true },
  shares:      { type: [ShareSchema], default: [] },
  created_at:  { type: Date, default: Date.now }
});

module.exports = mongoose.model('Expense', ExpenseSchema);
