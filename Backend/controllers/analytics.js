const mongoose = require('mongoose');

const Customer = require('../models/customer');
const PawnTicket = require('../models/pawnTicket');
const Activity = require('../models/activity');
const Payment = require('../models/payment');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/response');

exports.getFinancialReport = asyncHandler(async (req, res) => {
  const { shopId } = req.user;
  const shopObjectId = new mongoose.Types.ObjectId(shopId);
  
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const searchQuery = req.query.search || '';
  const skip = (page - 1) * limit;

  // Build match conditions
  const matchConditions = { shop_id: shopObjectId };
  if (searchQuery) {
    matchConditions.ticket_number = { $regex: searchQuery, $options: 'i' };
  }

  // First, get total count for pagination
  const countPipeline = [
    { $match: matchConditions },
    { $count: 'total' },
  ];
  const countResult = await PawnTicket.aggregate(countPipeline);
  const totalItems = countResult[0]?.total || 0;
  const totalPages = Math.ceil(totalItems / limit);

  const report = await PawnTicket.aggregate([
    { $match: matchConditions },
    {
      $lookup: {
        from: 'payments',
        localField: '_id',
        foreignField: 'ticket_id',
        as: 'payment_history',
      },
    },
    {
      $lookup: {
        from: 'customers',
        localField: 'customer_id',
        foreignField: '_id',
        as: 'customer',
      },
    },
    { $unwind: { path: '$customer', preserveNullAndEmptyArrays: true } },
    {
      $addFields: {
        total_interest_paid: {
          $sum: {
            $map: {
              input: {
                $filter: {
                  input: '$payment_history',
                  as: 'p',
                  cond: { $eq: ['$$p.payment_for', 'interest'] },
                },
              },
              as: 'i',
              in: '$$i.amount_paid',
            },
          },
        },
        total_principal_paid: {
          $sum: {
            $map: {
              input: {
                $filter: {
                  input: '$payment_history',
                  as: 'p',
                  cond: { $eq: ['$$p.payment_for', 'principal'] },
                },
              },
              as: 'i',
              in: '$$i.amount_paid',
            },
          },
        },
      },
    },
    {
      $project: {
        _id: 1,
        ticket_number: 1,
        status: 1,
        original_loan_amount: 1,
        loan_amount: 1,
        total_interest_paid: 1,
        total_principal_paid: 1,
        customer_name: '$customer.full_name',
      },
    },
    { $sort: { ticket_number: 1 } },
    { $skip: skip },
    { $limit: limit },
  ]);

  return sendSuccess(res, {
    message: 'Financial report fetched successfully.',
    data: report,
    meta: {
      page,
      totalPages,
      totalItems,
      limit,
    },
  });
});

exports.getDashboardStats = asyncHandler(async (req, res) => {
  const { shopId } = req.user;
  const shopObjectId = new mongoose.Types.ObjectId(shopId);

  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const statsPromise = PawnTicket.aggregate([
    { $match: { shop_id: shopObjectId } },
    {
      $group: {
        _id: null,
        total_loan_active: {
          $sum: { $cond: [{ $eq: ['$status', 'active'] }, '$loan_amount', 0] },
        },
        monthly_loan_given: {
          $sum: { $cond: [{ $gte: ['$pawned_date', thirtyDaysAgo] }, '$loan_amount', 0] },
        },
        total_active_tickets: {
          $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] },
        },
      },
    },
  ]);

  const genderDataPromise = Customer.aggregate([
    { $match: { shop_id: shopObjectId, gender: { $ne: null } } },
    { $group: { _id: '$gender', count: { $sum: 1 } } },
    { $project: { _id: 0, gender: '$_id', count: 1 } },
  ]);

  const areaDataPromise = Customer.aggregate([
    { $match: { shop_id: shopObjectId, 'address.pincode': { $ne: null, $ne: '' } } },
    { $group: { _id: '$address.pincode', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 5 },
    { $project: { _id: 0, pincode: '$_id', count: 1 } },
  ]);

  const topCustomersPromise = PawnTicket.aggregate([
    { $match: { shop_id: shopObjectId } },
    { $group: { _id: '$customer_id', total_loan: { $sum: '$loan_amount' } } },
    { $sort: { total_loan: -1 } },
    { $limit: 5 },
    {
      $lookup: {
        from: 'customers',
        localField: '_id',
        foreignField: '_id',
        as: 'customer_details',
      },
    },
    { $unwind: '$customer_details' },
    {
      $project: {
        _id: 1,
        full_name: '$customer_details.full_name',
        total_loan: 1,
      },
    },
  ]);

  const recentActivityPromise = Activity.find({ shop_id: shopId })
    .populate('user_id', 'full_name')
    .sort({ createdAt: -1 })
    .limit(5);

  const [stats, genderData, areaData, topCustomers, recentActivity] = await Promise.all([
    statsPromise,
    genderDataPromise,
    areaDataPromise,
    topCustomersPromise,
    recentActivityPromise,
  ]);

  return sendSuccess(res, {
    message: 'Dashboard stats fetched successfully.',
    data: {
      stats: stats[0] || {
        total_loan_active: 0,
        monthly_loan_given: 0,
        total_active_tickets: 0,
      },
      gender_data: genderData,
      area_data: areaData,
      top_customers: topCustomers,
      recent_activity: recentActivity,
    },
  });
});

exports.getCustomerStats = asyncHandler(async (req, res) => {
  const { shopId } = req.user;
  const customerId = new mongoose.Types.ObjectId(req.params.id);
  const shopObjectId = new mongoose.Types.ObjectId(shopId);

  const stats = await PawnTicket.aggregate([
    {
      $match: {
        shop_id: shopObjectId,
        customer_id: customerId,
      },
    },
    {
      $group: {
        _id: null,
        total_loan_value: { $sum: '$loan_amount' },
        total_active_loan: {
          $sum: { $cond: [{ $eq: ['$status', 'active'] }, '$loan_amount', 0] },
        },
        total_tickets: { $sum: 1 },
        active_tickets: {
          $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] },
        },
      },
    },
  ]);

  const payments = await Payment.aggregate([
    {
      $match: {
        shop_id: shopObjectId,
        customer_id: customerId,
      },
    },
    {
      $group: {
        _id: '$payment_for',
        total_paid: { $sum: '$amount_paid' },
      },
    },
  ]);

  return sendSuccess(res, {
    message: 'Customer stats fetched successfully.',
    data: {
      stats:
        stats[0] || {
          total_loan_value: 0,
          total_active_loan: 0,
          total_tickets: 0,
          active_tickets: 0,
        },
      payments,
    },
  });
});
