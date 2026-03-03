const express = require('express');
const router = express.Router();
const Company = require('../models/Company');

// GET /api/companies - List/search companies
router.get('/', async (req, res) => {
    try {
        const { q } = req.query;
        let query = {};

        if (q && q.trim()) {
            const searchTerm = q.trim();
            query = {
                $or: [
                    { name: { $regex: searchTerm, $options: 'i' } },
                    { registrationNumber: { $regex: searchTerm, $options: 'i' } },
                    { bankAccount: { $regex: searchTerm, $options: 'i' } },
                    { contactPerson: { $regex: searchTerm, $options: 'i' } }
                ]
            };
        }

        const companies = await Company.find(query).sort({ name: 1 }).limit(50);
        res.json(companies);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// GET /api/companies/:id - Get single company
router.get('/:id', async (req, res) => {
    try {
        const company = await Company.findById(req.params.id);
        if (!company) {
            return res.status(404).json({ message: 'Компани олдсонгүй' });
        }
        res.json(company);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// POST /api/companies - Create company
router.post('/', async (req, res) => {
    try {
        const company = await Company.create(req.body);
        res.status(201).json(company);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// PUT /api/companies/:id - Update company
router.put('/:id', async (req, res) => {
    try {
        const company = await Company.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });
        if (!company) {
            return res.status(404).json({ message: 'Компани олдсонгүй' });
        }
        res.json(company);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// DELETE /api/companies/:id - Delete company
router.delete('/:id', async (req, res) => {
    try {
        const company = await Company.findByIdAndDelete(req.params.id);
        if (!company) {
            return res.status(404).json({ message: 'Компани олдсонгүй' });
        }
        res.json({ message: 'Компани устгагдлаа' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
