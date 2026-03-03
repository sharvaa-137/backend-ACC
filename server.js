const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Middleware
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
}));
app.use(express.json());

// Routes
app.use('/api/companies', require('./routes/companies'));
app.use('/api/transactions', require('./routes/transactions'));
app.use('/api/reports', require('./routes/reports'));

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Test endpoint - checks DB connectivity and returns stats
app.get('/api/test', async (req, res) => {
    try {
        const mongoose = require('mongoose');
        const Company = require('./models/Company');
        const Transaction = require('./models/Transaction');

        const dbState = mongoose.connection.readyState;
        const states = { 0: 'disconnected', 1: 'connected', 2: 'connecting', 3: 'disconnecting' };

        const [companyCount, transactionCount] = await Promise.all([
            Company.countDocuments(),
            Transaction.countDocuments()
        ]);

        res.json({
            status: 'ok',
            database: states[dbState] || 'unknown',
            stats: {
                companies: companyCount,
                transactions: transactionCount
            },
            server: {
                uptime: process.uptime(),
                memory: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + 'MB',
                nodeVersion: process.version
            },
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
