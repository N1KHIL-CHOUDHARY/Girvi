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

exports.getPawnTickets = async (req, res) => {
  try {
    // 1. Get query params, with defaults
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const searchQuery = req.query.search || '';

    // 2. Calculate the number of documents to skip
    const skip = (page - 1) * limit;

    // 3. Create a query object
    const query = {
      shop_id: req.user.shopId,
    };
    if (searchQuery) {
     e
      query.$or = [
        { ticket_number: { $regex: searchQuery, $options: 'i' } },
        { 'items.name': { $regex: searchQuery, $options: 'i' } }
      ];
    }

    
    const totalPawnTickets = await PawnTicket.countDocuments(query);

    const tickets = await PawnTicket.find(query)
      .populate('customer_id', 'full_name phone') 
      .sort({ pawned_date: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      totalPawnTickets,
      totalPages: Math.ceil(totalPawnTickets / limit),
      currentPage: page,
      tickets, // Changed from 'customers'
    });

  } catch (error) {
    console.error('GET PAWN TICKETS ERROR:', error);
    res.status(500).json({ message: 'Server error' });
  }
};


exports.getPawnTicketsForCustomer = async (req, res) => {
  try {
    // 1. Get the customerId from the URL parameters
    const { id } = req.params;

    // 2. Find all tickets that match the customer_id AND the user's shop_id (for security)
    const tickets = await PawnTicket.find({
      shop_id: req.user.shopId,
      customer_id: id
    })
    .populate('customer_id', 'full_name') // We don't need this, but it's good practice
    .sort({ pawned_date: -1 });

    res.status(200).json({
      count: tickets.length,
      tickets,
    });

  } catch (error)
 {
    console.error('GET PAWN TICKETS FOR CUSTOMER ERROR:', error);
    res.status(500).json({ message: 'Server error' });
  }
};