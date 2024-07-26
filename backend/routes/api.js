const express = require('express');
const router = express.Router();
const axios = require('axios');
const Transaction = require('../models/Transaction');

// API to initialize the database
router.get('/initialize', async (req, res) => {
    try {
        const response = await axios.get('https://s3.amazonaws.com/roxiler.com/product_transaction.json');
        const transactions = response.data;

        await Transaction.deleteMany({});
        await Transaction.insertMany(transactions);

        res.status(200).send('Database initialized with seed data');
    } catch (error) {
        res.status(500).send('Error initializing database');
    }
});

// API to list all transactions with search and pagination
router.get('/transactions', async (req, res) => {
    const { month, search = '', page = 1, perPage = 10 } = req.query;
    const regex = new RegExp(search, 'i');
    const startOfMonth = new Date(new Date().getFullYear(), month - 1, 1);
    const endOfMonth = new Date(new Date().getFullYear(), month, 0);

    try {
        const transactions = await Transaction.find({
            dateOfSale: { $gte: startOfMonth, $lte: endOfMonth },
            $or: [{ title: regex }, { description: regex }, { price: regex }]
        })
            .skip((page - 1) * perPage)
            .limit(parseInt(perPage));

        res.json(transactions);
    } catch (error) {
        res.status(500).send('Error fetching transactions');
    }
});

// API for statistics
router.get('/statistics', async (req, res) => {
    const { month } = req.query;
    const startOfMonth = new Date(new Date().getFullYear(), month - 1, 1);
    const endOfMonth = new Date(new Date().getFullYear(), month, 0);

    try {
        const totalSales = await Transaction.aggregate([
            { $match: { dateOfSale: { $gte: startOfMonth, $lte: endOfMonth } } },
            { $group: { _id: null, totalAmount: { $sum: '$price' }, soldItems: { $sum: 1 }, notSoldItems: { $sum: { $cond: ['$sold', 0, 1] } } } }
        ]);

        res.json(totalSales[0]);
    } catch (error) {
        res.status(500).send('Error fetching statistics');
    }
});

// API for bar chart
router.get('/barchart', async (req, res) => {
    const { month } = req.query;
    const startOfMonth = new Date(new Date().getFullYear(), month - 1, 1);
    const endOfMonth = new Date(new Date().getFullYear(), month, 0);

    try {
        const priceRanges = [
            { range: '0-100', min: 0, max: 100 },
            { range: '101-200', min: 101, max: 200 },
            { range: '201-300', min: 201, max: 300 },
            { range: '301-400', min: 301, max: 400 },
            { range: '401-500', min: 401, max: 500 },
            { range: '501-600', min: 501, max: 600 },
            { range: '601-700', min: 601, max: 700 },
            { range: '701-800', min: 701, max: 800 },
            { range: '801-900', min: 801, max: 900 },
            { range: '901-above', min: 901, max: Infinity }
        ];

        const result = await Promise.all(priceRanges.map(async (range) => {
            const count = await Transaction.countDocuments({
                dateOfSale: { $gte: startOfMonth, $lte: endOfMonth },
                price: { $gte: range.min, $lte: range.max }
            });
            return { range: range.range, count };
        }));

        res.json(result);
    } catch (error) {
        res.status(500).send('Error fetching bar chart data');
    }
});

// API for pie chart
router.get('/piechart', async (req, res) => {
    const { month } = req.query;
    const startOfMonth = new Date(new Date().getFullYear(), month - 1, 1);
    const endOfMonth = new Date(new Date().getFullYear(), month, 0);

    try {
        const categories = await Transaction.aggregate([
            { $match: { dateOfSale: { $gte: startOfMonth, $lte: endOfMonth } } },
            { $group: { _id: '$category', count: { $sum: 1 } } }
        ]);

        res.json(categories);
    } catch (error) {
        res.status(500).send('Error fetching pie chart data');
    }
});

// API to fetch combined data
router.get('/combined', async (req, res) => {
    const { month } = req.query;

    try {
        const [transactions, statistics, barChart, pieChart] = await Promise.all([
            axios.get(`http://localhost:3000/api/transactions?month=${month}`),
            axios.get(`http://localhost:3000/api/statistics?month=${month}`),
            axios.get(`http://localhost:3000/api/barchart?month=${month}`),
            axios.get(`http://localhost:3000/api/piechart?month=${month}`)
        ]);

        res.json({
            transactions: transactions.data,
            statistics: statistics.data,
            barChart: barChart.data,
            pieChart: pieChart.data
        });
    } catch (error) {
        res.status(500).send('Error fetching combined data');
    }
});

module.exports = router;
