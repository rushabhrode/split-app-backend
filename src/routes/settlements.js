// src/routes/settlements.js
const express = require('express');
const Expense = require('../models/Expense');
const { calculateBalances, calculateSettlements } = require('../utils/settlementCalculator');
const router  = express.Router();

// GET /people — list all unique names
router.get('/people', async (req, res, next) => {
  try {
    const all = await Expense.find();
    const set = new Set();
    all.forEach(exp => {
      set.add(exp.paid_by);
      exp.shares.forEach(s => set.add(s.person));
    });
    res.json({ success: true, data: Array.from(set) });
  } catch (err) {
    next(err);
  }
});

// GET /balances — net balance per person
router.get('/balances', async (req, res, next) => {
  try {
    const all      = await Expense.find();
    const balances = calculateBalances(all);
    res.json({ success: true, data: balances });
  } catch (err) {
    next(err);
  }
});

// GET /settlements — optimized transactions list
router.get('/settlements', async (req, res, next) => {
  try {
    const all         = await Expense.find();
    const balances    = calculateBalances(all);
    const settlements = calculateSettlements(balances);
    res.json({ success: true, data: settlements });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
