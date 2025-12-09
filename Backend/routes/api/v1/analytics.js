// Analytics routes
const express = require('express');
const router = express.Router();
const { getDashboardStats } = require('../../../controllers/analytics.js');

// @route   GET /api/v1/app/dashboard
// @desc    Get all dashboard stats
router.get('/dashboard', getDashboardStats); // <-- THIS LINE MUST EXIST

module.exports = router;