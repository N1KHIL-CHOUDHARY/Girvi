// Handles logic for pawn ticket CRUD
const PawnTicket = require('../models/pawnTicket.js');
const Customer = require('../models/customer.js');
const { logActivity } = require('../services/activityLogger.js');

exports.createPawnTicket = async (req, res) => {
  const { customer_id, ticket_number, loan_amount, interest_rate, adv_amount, items, pawned_date } = req.body;

  try {
    // 1. Verify the customer belongs to this shop
    const customer = await Customer.findOne({ 
      _id: customer_id, 
      shop_id: req.user.shopId 
    });
    
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found or does not belong to this shop' });
    }

    const newTicket = new PawnTicket({
      customer_id,
      ticket_number,
      loan_amount,
      interest_rate,
      adv_amount,
      items,
      pawned_date: pawned_date || new Date(),
      shop_id: req.user.shopId,           // From 'authenticate' middleware
      created_by_user_id: req.user.userId // From 'authenticate' middleware
    });

    const savedTicket = await newTicket.save();
    
    res.status(201).json({
      message: 'Pawn ticket created successfully',
      ticket: savedTicket,
    });

  } catch (error) {
    console.error('CREATE PAWN TICKET ERROR:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * @desc    Get all pawn tickets for the logged-in user's shop
 * @route   GET /api/v1/app/pawns
 */
exports.getPawnTickets = async (req, res) => {
  try {
    // We ONLY find tickets that match the user's 'shopId'
    const tickets = await PawnTicket.find({ shop_id: req.user.shopId })
      .populate('customer_id', 'full_name phone') // Get customer's name and phone
      .sort({ pawned_date: -1 }); // Show newest first

    res.status(200).json({
      count: tickets.length,
      tickets,
    });

  } catch (error) {
    console.error('GET PAWN TICKETS ERROR:', error);
    res.status(500).json({ message: 'Server error' });
  }
};