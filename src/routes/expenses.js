// src/routes/expenses.js
const express = require('express');
const { body, validationResult } = require('express-validator');
const Expense = require('../models/Expense');
const router  = express.Router();

// Validation chain for create & update
const expenseValidation = [
  body('amount')
    .optional({ nullable: false })
    .isFloat({ gt: 0 }).withMessage('amount must be a positive number'),
  body('description')
    .optional({ nullable: false })
    .isString().withMessage('description must be text')
    .notEmpty().withMessage('description cannot be empty'),
  body('paid_by')
    .optional({ nullable: false })
    .isString().withMessage('paid_by must be text')
    .notEmpty().withMessage('paid_by cannot be empty'),
  body('shares')
    .optional()
    .isArray().withMessage('shares must be an array'),
  body('shares.*.person')
    .if(body('shares').exists())
    .isString().withMessage('share.person must be text')
    .notEmpty().withMessage('share.person cannot be empty'),
  body('shares.*.type')
    .if(body('shares').exists())
    .isIn(['equal','percentage','exact'])
    .withMessage('share.type must be one of equal, percentage, exact'),
  body('shares')
    .optional()
    .custom(shares => {
      for (const share of shares) {
        if (['percentage','exact'].includes(share.type)) {
          if (typeof share.value !== 'number' || share.value <= 0) {
            throw new Error(
              'share.value must be a positive number when type is percentage or exact'
            );
          }
        }
      }
      return true;
    })
];

// GET /expenses — list all
router.get('/', async (req, res, next) => {
  try {
    const expenses = await Expense.find().sort('-created_at');
    res.json({ success: true, data: expenses });
  } catch (err) {
    next(err);
  }
});

// POST /expenses — create
router.post(
  '/',
  [
    body('amount')
      .exists().withMessage('amount is required')
      .isFloat({ gt: 0 }).withMessage('amount must be a positive number'),
    body('description')
      .exists().withMessage('description is required')
      .isString().withMessage('description must be text')
      .notEmpty().withMessage('description cannot be empty'),
    body('paid_by')
      .exists().withMessage('paid_by is required')
      .isString().withMessage('paid_by must be text')
      .notEmpty().withMessage('paid_by cannot be empty'),
    ...expenseValidation.slice(3) // share validations
  ],
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array().map(e => e.msg)
      });
    }
    try {
      const expense = await Expense.create(req.body);
      res.status(201).json({
        success: true,
        data: expense,
        message: 'Expense added successfully'
      });
    } catch (err) {
      next(err);
    }
  }
);

// PUT /expenses/:id — update
router.put(
  '/:id',
  expenseValidation,
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array().map(e => e.msg)
      });
    }
    try {
      const updated = await Expense.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
      );
      if (!updated) {
        return res.status(404).json({ success: false, message: 'Expense not found' });
      }
      res.json({ success: true, data: updated });
    } catch (err) {
      next(err);
    }
  }
);

// DELETE /expenses/:id — remove
router.delete('/:id', async (req, res, next) => {
  try {
    const deleted = await Expense.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Expense not found' });
    }
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

module.exports = router;
