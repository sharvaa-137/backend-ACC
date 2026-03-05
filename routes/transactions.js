const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction');

// GET /api/transactions - List transactions with date/month filter
router.get('/', async (req, res) => {
    try {
        const { date, from, to, year, month } = req.query;
        let query = {};

        if (date) {
            // Single day filter
            const dayStart = new Date(date);
            dayStart.setHours(0, 0, 0, 0);
            const dayEnd = new Date(date);
            dayEnd.setHours(23, 59, 59, 999);
            query.transactionDate = { $gte: dayStart, $lte: dayEnd };
        } else if (year && month) {
            // Month filter — fetch all transactions for a given month
            const y = parseInt(year);
            const m = parseInt(month) - 1;
            const monthStart = new Date(y, m, 1);
            const monthEnd = new Date(y, m + 1, 0, 23, 59, 59, 999);
            query.transactionDate = { $gte: monthStart, $lte: monthEnd };
        } else if (from && to) {
            const fromDate = new Date(from);
            fromDate.setHours(0, 0, 0, 0);
            const toDate = new Date(to);
            toDate.setHours(23, 59, 59, 999);
            query.transactionDate = { $gte: fromDate, $lte: toDate };
        }

        const transactions = await Transaction.find(query)
            .populate('companyId')
            .sort({ transactionDate: -1, createdAt: -1 })
            .lean();

        res.json(transactions);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// POST /api/transactions - Create transaction
router.post('/', async (req, res) => {
    try {
        const transaction = await Transaction.create(req.body);
        const populated = await transaction.populate('companyId');
        res.status(201).json(populated);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// PUT /api/transactions/:id - Update transaction
router.put('/:id', async (req, res) => {
    try {
        const transaction = await Transaction.findByIdAndUpdate(req.params.id, req.body, {
            returnDocument: 'after',
            runValidators: true
        }).populate('companyId');
        if (!transaction) {
            return res.status(404).json({ message: 'Гүйлгээ олдсонгүй' });
        }
        res.json(transaction);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// DELETE /api/transactions/:id - Delete transaction
router.delete('/:id', async (req, res) => {
    try {
        const transaction = await Transaction.findByIdAndDelete(req.params.id);
        if (!transaction) {
            return res.status(404).json({ message: 'Гүйлгээ олдсонгүй' });
        }
        res.json({ message: 'Гүйлгээ устгагдлаа' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
