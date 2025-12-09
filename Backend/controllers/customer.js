const Customer = require('../models/customer');
const PawnTicket = require('../models/pawnTicket');
const Payment = require('../models/payment');
const { logActivity } = require('../services/activityLogger');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/response');
const ApiError = require('../utils/ApiError');

exports.createCustomer = asyncHandler(async (req, res) => {
  const {
    full_name,
    phone_number,
    address,
    gender,
    customer_photo_url,
    aadhaar_number,
    pan_number,
    shop_id,
  } = req.body;

  const newCustomer = new Customer({
    full_name,
    phone_number,
    address,
    gender,
    customer_photo_url,
    aadhaar_number,
    pan_number,
    shop_id: shop_id || null,
    created_by_user_id: null,
  });

  const savedCustomer = await newCustomer.save();

  if (shop_id) {
    await logActivity({
      shopId: shop_id,
      userId: null,
      type: 'NEW_CUSTOMER',
      message: `Created new customer: ${savedCustomer.full_name}`,
      customerId: savedCustomer._id,
    });
  }

  return sendSuccess(res, {
    status: 201,
    message: 'Customer created successfully.',
    data: savedCustomer,
  });
});

exports.getCustomers = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const searchQuery = req.query.search || '';
  const shop_id = req.query.shop_id;
  const skip = (page - 1) * limit;

  const query = {};
  if (shop_id) {
    query.shop_id = shop_id;
  }
  if (searchQuery) {
    query.full_name = { $regex: searchQuery, $options: 'i' };
  }

  const totalCustomers = await Customer.countDocuments(query);
  const customers = await Customer.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  return sendSuccess(res, {
    message: 'Customers fetched successfully.',
    data: {
      customers,
      totalCustomers,
      totalPages: Math.ceil(totalCustomers / limit),
      currentPage: page,
    },
    meta: {
      page,
      totalPages: Math.ceil(totalCustomers / limit),
      totalItems: totalCustomers,
    },
  });
});

exports.getCustomerById = asyncHandler(async (req, res) => {
  const query = { _id: req.params.id };
  if (req.query.shop_id) {
    query.shop_id = req.query.shop_id;
  }
  const customer = await Customer.findOne(query);

  if (!customer) {
    throw new ApiError(404, 'Customer not found.');
  }

  return sendSuccess(res, {
    message: 'Customer fetched successfully.',
    data: customer,
  });
});

exports.updateCustomer = asyncHandler(async (req, res) => {
  const query = { _id: req.params.id };
  if (req.query.shop_id) {
    query.shop_id = req.query.shop_id;
  }
  const updatedCustomer = await Customer.findOneAndUpdate(
    query,
    req.body,
    { new: true, runValidators: true }
  );

  if (!updatedCustomer) {
    throw new ApiError(404, 'Customer not found.');
  }

  if (updatedCustomer.shop_id) {
    await logActivity({
      shopId: updatedCustomer.shop_id,
      userId: null,
      type: 'UPDATED_CUSTOMER',
      message: `Updated customer details for: ${updatedCustomer.full_name}`,
      customerId: updatedCustomer._id,
    });
  }

  return sendSuccess(res, {
    message: 'Customer updated successfully.',
    data: updatedCustomer,
  });
});

exports.deleteCustomer = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const shop_id = req.query.shop_id;

  const query = { customer_id: id };
  if (shop_id) {
    query.shop_id = shop_id;
  }

  await PawnTicket.deleteMany(query);
  await Payment.deleteMany(query);

  const deleteQuery = { _id: id };
  if (shop_id) {
    deleteQuery.shop_id = shop_id;
  }

  const deletedCustomer = await Customer.findOneAndDelete(deleteQuery);

  if (!deletedCustomer) {
    throw new ApiError(404, 'Customer not found.');
  }

  if (deletedCustomer.shop_id) {
    await logActivity({
      shopId: deletedCustomer.shop_id,
      userId: null,
      type: 'DELETED_CUSTOMER',
      message: `Deleted customer: ${deletedCustomer.full_name}`,
      customerId: deletedCustomer._id,
    });
  }

  return sendSuccess(res, {
    message: 'Customer deleted successfully.',
    data: {
      customerId: deletedCustomer._id,
    },
  });
});
