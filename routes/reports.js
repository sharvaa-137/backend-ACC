const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction');

// GET /api/reports - Generate reports by day/month/quarter/year
router.get('/', async (req, res) => {
    try {
        const { type, date, year, month, quarter } = req.query;

        let startDate, endDate;

        switch (type) {
            case 'day':
                if (!date) return res.status(400).json({ message: 'date параметр шаардлагатай' });
                startDate = new Date(date);
                startDate.setHours(0, 0, 0, 0);
                endDate = new Date(date);
                endDate.setHours(23, 59, 59, 999);
                break;

            case 'month':
                if (!year || !month) return res.status(400).json({ message: 'year, month параметрүүд шаардлагатай' });
                startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
                endDate = new Date(parseInt(year), parseInt(month), 0, 23, 59, 59, 999);
                break;

            case 'quarter':
                if (!year || !quarter) return res.status(400).json({ message: 'year, quarter параметрүүд шаардлагатай' });
                const q = parseInt(quarter);
                startDate = new Date(parseInt(year), (q - 1) * 3, 1);
                endDate = new Date(parseInt(year), q * 3, 0, 23, 59, 59, 999);
                break;

            case 'year':
                if (!year) return res.status(400).json({ message: 'year параметр шаардлагатай' });
                startDate = new Date(parseInt(year), 0, 1);
                endDate = new Date(parseInt(year), 11, 31, 23, 59, 59, 999);
                break;

            default:
                return res.status(400).json({ message: 'type нь day, month, quarter, year байх ёстой' });
        }

        // Get transactions in date range
        const transactions = await Transaction.find({
            transactionDate: { $gte: startDate, $lte: endDate }
        })
            .populate('companyId')
            .sort({ transactionDate: 1, createdAt: 1 });

        // Calculate summary
        const totalAmount = transactions.reduce((sum, t) => sum + t.amount, 0);
        const transactionCount = transactions.length;

        // Group by date for detailed breakdown
        const groupedByDate = {};
        transactions.forEach(t => {
            const dateKey = t.transactionDate.toISOString().split('T')[0];
            if (!groupedByDate[dateKey]) {
                groupedByDate[dateKey] = { transactions: [], total: 0 };
            }
            groupedByDate[dateKey].transactions.push(t);
            groupedByDate[dateKey].total += t.amount;
        });

        // Group by company for summary
        const groupedByCompany = {};
        transactions.forEach(t => {
            const companyName = t.companyId ? t.companyId.name : 'Тодорхойгүй';
            const companyId = t.companyId ? t.companyId._id.toString() : 'unknown';
            if (!groupedByCompany[companyId]) {
                groupedByCompany[companyId] = { name: companyName, total: 0, count: 0 };
            }
            groupedByCompany[companyId].total += t.amount;
            groupedByCompany[companyId].count += 1;
        });

        res.json({
            type,
            startDate,
            endDate,
            totalAmount,
            transactionCount,
            transactions,
            groupedByDate,
            groupedByCompany: Object.values(groupedByCompany)
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
