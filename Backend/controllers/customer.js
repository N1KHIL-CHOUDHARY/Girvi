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
  } = req.body;
  const { shopId, userId } = req.user;

  const newCustomer = new Customer({
    full_name,
    phone_number,
    address,
    gender,
    customer_photo_url,
    aadhaar_number,
    pan_number,
    shop_id: shopId,
    created_by_user_id: userId,
  });

  const savedCustomer = await newCustomer.save();

  await logActivity({
    shopId,
    userId,
    type: 'NEW_CUSTOMER',
    message: `Created new customer: ${savedCustomer.full_name}`,
    customerId: savedCustomer._id,
  });

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
  const skip = (page - 1) * limit;

  const query = { shop_id: req.user.shopId };
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
    data: customers,
    meta: {
      page,
      totalPages: Math.ceil(totalCustomers / limit) || 1,
      totalItems: totalCustomers,
    },
  });
});

exports.getCustomerById = asyncHandler(async (req, res) => {
  const customer = await Customer.findOne({
    _id: req.params.id,
    shop_id: req.user.shopId,
  });

  if (!customer) {
    throw new ApiError(404, 'Customer not found.');
  }

  return sendSuccess(res, {
    message: 'Customer fetched successfully.',
    data: customer,
  });
});

exports.updateCustomer = asyncHandler(async (req, res) => {
  const updatedCustomer = await Customer.findOneAndUpdate(
    { _id: req.params.id, shop_id: req.user.shopId },
    req.body,
    { new: true, runValidators: true }
  );

  if (!updatedCustomer) {
    throw new ApiError(404, 'Customer not found.');
  }

  await logActivity({
    shopId: req.user.shopId,
    userId: req.user.userId,
    type: 'UPDATED_CUSTOMER',
    message: `Updated customer details for: ${updatedCustomer.full_name}`,
    customerId: updatedCustomer._id,
  });

  return sendSuccess(res, {
    message: 'Customer updated successfully.',
    data: updatedCustomer,
  });
});

exports.deleteCustomer = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { shopId, userId } = req.user;

  await PawnTicket.deleteMany({
    customer_id: id,
    shop_id: shopId,
  });

  await Payment.deleteMany({
    customer_id: id,
    shop_id: shopId,
  });

  const deletedCustomer = await Customer.findOneAndDelete({
    _id: id,
    shop_id: shopId,
  });

  if (!deletedCustomer) {
    throw new ApiError(404, 'Customer not found.');
  }

  await logActivity({
    shopId,
    userId,
    type: 'DELETED_CUSTOMER',
    message: `Deleted customer: ${deletedCustomer.full_name}`,
    customerId: deletedCustomer._id,
  });

  return sendSuccess(res, {
    message: 'Customer deleted successfully.',
    data: deletedCustomer,
  });
});
