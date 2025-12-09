const Payment = require('../models/payment');
const PawnTicket = require('../models/pawnTicket');
const { logActivity } = require('../services/activityLogger');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/response');
const ApiError = require('../utils/ApiError');

exports.createPayment = asyncHandler(async (req, res) => {
  const { ticket_id, amount_paid, payment_for, payment_date } = req.body;
  const { shopId, userId } = req.user;

  const amount = Number(amount_paid);
  if (!Number.isFinite(amount) || amount <= 0) {
    throw new ApiError(400, 'amount_paid must be a number greater than 0.');
  }

  if (!['interest', 'principal'].includes(payment_for)) {
    throw new ApiError(400, 'payment_for must be either interest or principal.');
  }

  const ticket = await PawnTicket.findOne({
    _id: ticket_id,
    shop_id: shopId,
    is_deleted: { $ne: true },
  }).populate('customer_id', 'full_name');

  if (!ticket) {
    throw new ApiError(404, 'Pawn ticket not found for this shop.');
  }

  if (payment_for === 'principal' && ticket.loan_amount <= 0) {
    throw new ApiError(400, 'This ticket is already settled.');
  }

  const payment = await Payment.create({
    shop_id: shopId,
    customer_id: ticket.customer_id,
    ticket_id,
    created_by_user_id: userId,
    amount_paid: amount,
    payment_for,
    payment_date: payment_date ? new Date(payment_date) : new Date(),
  });

  if (payment_for === 'principal') {
    ticket.loan_amount = Math.max(0, ticket.loan_amount - amount);
    if (ticket.loan_amount <= 0) {
      ticket.status = 'settled';
      ticket.settled_date = ticket.settled_date || new Date();
    }
    await ticket.save();
  }

  await logActivity({
    shopId,
    userId,
    type: 'NEW_PAYMENT',
    message: `Recorded ${payment_for} payment of ₹${amount} for ticket ${ticket.ticket_number}`,
    customerId: ticket.customer_id?._id || ticket.customer_id,
    ticketId: ticket._id,
  });

  return sendSuccess(res, {
    status: 201,
    message: 'Payment recorded successfully.',
    data: payment,
  });
});

exports.getPaymentsForTicket = asyncHandler(async (req, res) => {
  const { ticketId } = req.params;
  const { shopId } = req.user;

  const ticketExists = await PawnTicket.exists({
    _id: ticketId,
    shop_id: shopId,
    is_deleted: { $ne: true },
  });

  if (!ticketExists) {
    throw new ApiError(404, 'Pawn ticket not found for this shop.');
  }

  const payments = await Payment.find({
    ticket_id: ticketId,
    shop_id: shopId,
  })
    .populate('created_by_user_id', 'full_name email')
    .sort({ payment_date: -1, createdAt: -1 });

  return sendSuccess(res, {
    message: 'Payments fetched successfully.',
    data: payments,
  });
});

