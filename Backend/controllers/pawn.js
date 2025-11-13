const PawnTicket = require('../models/pawnTicket');
const Customer = require('../models/customer');
const Payment = require('../models/payment');
const { logActivity } = require('../services/activityLogger');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/response');
const ApiError = require('../utils/ApiError');

exports.createPawnTicket = asyncHandler(async (req, res) => {
  const {
    customer_id,
    ticket_number,
    loan_amount,
    interest_rate,
    adv_amount,
    items,
    pawned_date,
  } = req.body;
  const { shopId, userId } = req.user;

  const customer = await Customer.findOne({
    _id: customer_id,
    shop_id: shopId,
  });

  if (!customer) {
    throw new ApiError(404, 'Customer not found for this shop.');
  }

  const existingTicket = await PawnTicket.findOne({ ticket_number, shop_id: shopId });
  if (existingTicket) {
    throw new ApiError(409, 'Ticket number already exists.');
  }

  const newTicket = new PawnTicket({
    customer_id,
    ticket_number,
    loan_amount,
    interest_rate,
    adv_amount,
    items,
    pawned_date: pawned_date || new Date(),
    shop_id: shopId,
    created_by_user_id: userId,
  });

  const savedTicket = await newTicket.save();

  await logActivity({
    shopId,
    userId,
    type: 'NEW_TICKET',
    message: `Created ticket ${savedTicket.ticket_number} for ${customer.full_name} (₹${savedTicket.loan_amount})`,
    customerId: customer._id,
    ticketId: savedTicket._id,
  });

  return sendSuccess(res, {
    status: 201,
    message: 'Pawn ticket created successfully.',
    data: savedTicket,
  });
});

exports.getPawnTickets = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const searchQuery = req.query.search || '';
  const status = req.query.status || 'active';
  const skip = (page - 1) * limit;

  const query = {
    shop_id: req.user.shopId,
  };

  if (searchQuery) {
    query.$or = [
      { ticket_number: { $regex: searchQuery, $options: 'i' } },
      { 'items.name': { $regex: searchQuery, $options: 'i' } },
    ];
  }

  if (status !== 'all') {
    query.status = status;
  }

  const totalPawnTickets = await PawnTicket.countDocuments(query);

  const tickets = await PawnTicket.find(query)
    .populate('customer_id', 'full_name phone')
    .sort({ pawned_date: -1 })
    .skip(skip)
    .limit(limit);

  return sendSuccess(res, {
    message: 'Pawn tickets fetched successfully.',
    data: tickets,
    meta: {
      page,
      totalPages: Math.ceil(totalPawnTickets / limit) || 1,
      totalItems: totalPawnTickets,
    },
  });
});

exports.getPawnTicketById = asyncHandler(async (req, res) => {
  const ticket = await PawnTicket.findOne({
    _id: req.params.id,
    shop_id: req.user.shopId,
  }).populate('customer_id', 'full_name phone_number address');

  if (!ticket) {
    throw new ApiError(404, 'Ticket not found.');
  }

  return sendSuccess(res, {
    message: 'Pawn ticket fetched successfully.',
    data: ticket,
  });
});

exports.updatePawnTicket = asyncHandler(async (req, res) => {
  const updatedTicket = await PawnTicket.findOneAndUpdate(
    { _id: req.params.id, shop_id: req.user.shopId },
    req.body,
    { new: true, runValidators: true }
  );

  if (!updatedTicket) {
    throw new ApiError(404, 'Ticket not found.');
  }

  return sendSuccess(res, {
    message: 'Pawn ticket updated successfully.',
    data: updatedTicket,
  });
});

exports.deletePawnTicket = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { shopId, userId } = req.user;

  await Payment.deleteMany({
    ticket_id: id,
    shop_id: shopId,
  });

  const deletedTicket = await PawnTicket.findOneAndDelete({
    _id: id,
    shop_id: shopId,
  });

  if (!deletedTicket) {
    throw new ApiError(404, 'Ticket not found.');
  }

  await logActivity({
    shopId,
    userId,
    type: 'DELETED_TICKET',
    message: `Deleted ticket ${deletedTicket.ticket_number}`,
    ticketId: deletedTicket._id,
  });

  return sendSuccess(res, {
    message: 'Pawn ticket deleted successfully.',
  });
});

exports.settlePawnTicket = asyncHandler(async (req, res) => {
  const ticket = await PawnTicket.findOne({
    _id: req.params.id,
    shop_id: req.user.shopId,
  });

  if (!ticket) {
    throw new ApiError(404, 'Ticket not found.');
  }

  ticket.status = 'settled';
  ticket.settled_date = new Date();
  const savedTicket = await ticket.save();

  await logActivity({
    shopId: req.user.shopId,
    userId: req.user.userId,
    type: 'SETTLED_TICKET',
    message: `Settled ticket ${savedTicket.ticket_number}`,
    ticketId: savedTicket._id,
  });

  return sendSuccess(res, {
    message: 'Pawn ticket settled successfully.',
    data: savedTicket,
  });
});

exports.getPawnTicketsForCustomer = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const tickets = await PawnTicket.find({
    shop_id: req.user.shopId,
    customer_id: id,
  })
    .populate('customer_id', 'full_name')
    .sort({ pawned_date: -1 });

  return sendSuccess(res, {
    message: 'Customer pawn tickets fetched successfully.',
    data: tickets,
    meta: {
      totalItems: tickets.length,
    },
  });
});
