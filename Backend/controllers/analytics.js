const Customer = require('../models/customer.js');
const PawnTicket = require('../models/pawnTicket.js');
const Activity = require('../models/activity.js');
const Payment = require('../models/payment.js'); // <-- This is correct
const mongoose = require('mongoose');

/**
 * @desc    Get all dashboard stats in one call
 * @route   GET /api/v1/app/dashboard
 */
exports.getDashboardStats = async (req, res) => {
  try {
    const { shopId } = req.user;
    const shopObjectId = new mongoose.Types.ObjectId(shopId);

    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    
    // 1. Key Stats
    const statsPromise = PawnTicket.aggregate([
      { $match: { shop_id: shopObjectId } },
      {
        $group: {
          _id: null,
          total_loan_active: { $sum: { $cond: [{ $eq: ['$status', 'active'] }, '$loan_amount', 0] } },
          monthly_loan_given: { $sum: { $cond: [{ $gte: ['$pawned_date', thirtyDaysAgo] }, '$loan_amount', 0] } },
          total_active_tickets: { $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] } }
        }
      }
    ]);

    // 2. Gender Distribution
    const genderDataPromise = Customer.aggregate([
      { $match: { shop_id: shopObjectId, gender: { $ne: null } } },
      { $group: { _id: '$gender', count: { $sum: 1 } } },
      { $project: { _id: 0, gender: '$_id', count: 1 } }
    ]);

    // 3. Area-wise Data (Top 5 Pincodes)
    const areaDataPromise = Customer.aggregate([
      { $match: { shop_id: shopObjectId, 'address.pincode': { $ne: null, $ne: "" } } },
      { $group: { _id: '$address.pincode', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
      { $project: { _id: 0, pincode: '$_id', count: 1 } }
    ]);

    // 4. Top 5 Customers (by total loan amount)
    const topCustomersPromise = PawnTicket.aggregate([
      { $match: { shop_id: shopObjectId } },
      { $group: { _id: '$customer_id', total_loan: { $sum: '$loan_amount' } } },
      { $sort: { total_loan: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'customers', localField: '_id', foreignField: '_id', as: 'customer_details'
        }
      },
      { $unwind: '$customer_details' },
      { $project: { _id: 1, full_name: '$customer_details.full_name', total_loan: 1 } }
    ]);

    // 5. Recent Activity
    const recentActivityPromise = Activity.find({ shop_id: shopId })
      .populate('created_by_user_id', 'full_name') // Get user's name
      .sort({ createdAt: -1 })
      .limit(5);

    // Run all queries in parallel
    const [stats, genderData, areaData, topCustomers, recentActivity] = await Promise.all([
      statsPromise,
      genderDataPromise,
      areaDataPromise,
      topCustomersPromise,
      recentActivityPromise
    ]);

    res.status(200).json({
      stats: stats[0] || { total_loan_active: 0, monthly_loan_given: 0, total_active_tickets: 0 },
      gender_data: genderData,
      area_data: areaData,
      top_customers: topCustomers,
      recent_activity: recentActivity,
    });

  } catch (error) {
    console.error('GET DASHBOARD STATS ERROR:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * @desc    Get all stats for a single customer
 * @route   GET /api/v1/app/customers/:id/stats
 */
exports.getCustomerStats = async (req, res) => {
  try {
    const { shopId } = req.user;
    const customerId = new mongoose.Types.ObjectId(req.params.id);
    const shopObjectId = new mongoose.Types.ObjectId(shopId); // <-- Create ObjectId for shopId

    // 1. Key Stats for this customer
    const stats = await PawnTicket.aggregate([
      {
        $match: {
          shop_id: shopObjectId, // Use ObjectId
          customer_id: customerId
        }
      },
      {
        $group: {
          _id: null,
          total_loan_value: { $sum: '$loan_amount' },
          total_active_loan: {
            $sum: { $cond: [{ $eq: ['$status', 'active'] }, '$loan_amount', 0] }
          },
          total_tickets: { $sum: 1 },
          active_tickets: {
            $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] }
          }
        }
      }
    ]);

    // 2. Get payment history (total interest vs. principal)
    const payments = await Payment.aggregate([ // This line was failing
       {
        $match: {
          shop_id: shopObjectId, // Use ObjectId
          customer_id: customerId
        }
      },
      {
        $group: {
          _id: '$payment_for', // Group by 'interest' or 'principal'
          total_paid: { $sum: '$amount_paid' }
        }
      }
    ]);

    res.status(200).json({
      stats: stats[0] || { total_loan_value: 0, total_active_loan: 0, total_tickets: 0, active_tickets: 0 },
      payments: payments
    });

  } catch (error) {
    console.error('GET CUSTOMER STATS ERROR:', error);
    res.status(500).json({ message: 'Server error' });
  }
};