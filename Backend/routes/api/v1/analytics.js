// Analytics routes
const express = require('express');
const router = express.Router();
const { getDashboardStats, getFinancialReport } = require('../../../controllers/analytics.js');
const { authenticate, authorize } = require('../../../middlewares/auth.js');

router.use(authenticate);

// @route   GET /api/v1/app/dashboard
// @desc    Get all dashboard stats
router.get('/dashboard', getDashboardStats); // <-- THIS LINE MUST EXIST

// @route   GET /api/v1/app/stat/financial-report
router.get('/financial-report', getFinancialReport);

module.exports = router;