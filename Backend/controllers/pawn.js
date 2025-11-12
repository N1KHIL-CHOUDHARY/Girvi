// Handles logic for pawn ticket CRUD
const PawnTicket = require('../models/pawnTicket.js');
const Customer = require('../models/customer.js');
const Payment = require('../models/payment.js'); // Import Payment model for delete
const { logActivity } = require('../services/activityLogger.js');


exports.createPawnTicket = async (req, res) => {
  const { customer_id, ticket_number, loan_amount, interest_rate, adv_amount, items, pawned_date } = req.body;
  const { shopId, userId } = req.user; // Get from auth middleware

  try {
    // 1. Verify the customer belongs to this shop
    const customer = await Customer.findOne({ 
      _id: customer_id, 
      shop_id: shopId 
    });
    
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found or does not belong to this shop' });
    }

    // 2. Check for duplicate ticket number
    const existingTicket = await PawnTicket.findOne({ ticket_number, shop_id: shopId });
    if (existingTicket) {
      return res.status(400).json({ message: 'A ticket with this number already exists.' });
    }

    // 3. Create the new ticket
    const newTicket = new PawnTicket({
      customer_id,
      ticket_number,
      loan_amount,
      interest_rate,
      adv_amount,
      items,
      pawned_date: pawned_date || new Date(),
      shop_id: shopId,
      created_by_user_id: userId
    });

    const savedTicket = await newTicket.save();
    
    // 4. Log the activity
    await logActivity({
      shopId,
      userId,
      type: 'NEW_TICKET',
      message: `Created ticket ${savedTicket.ticket_number} for ${customer.full_name} (₹${savedTicket.loan_amount})`,
      customerId: customer._id,
      ticketId: savedTicket._id,
    });
    
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
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const searchQuery = req.query.search || '';
    const status = req.query.status || 'active'; // <-- 1. GET THE STATUS
    const skip = (page - 1) * limit;

    const query = {
      shop_id: req.user.shopId,
    };
    if (searchQuery) {
      query.$or = [
        { ticket_number: { $regex: searchQuery, $options: 'i' } },
        { 'items.name': { $regex: searchQuery, $options: 'i' } }
      ];
    }
    
    // --- 2. ADD STATUS TO THE QUERY ---
    if (status !== 'all') {
      query.status = status;
    }
    // ---------------------------------

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
      tickets,
    });

  } catch (error) {
    console.error('GET PAWN TICKETS ERROR:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getPawnTicketById = async (req, res) => {
  try {
    const ticket = await PawnTicket.findOne({
      _id: req.params.id,
      shop_id: req.user.shopId
    }).populate('customer_id', 'full_name phone_number address');

    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }
    res.status(200).json(ticket);
  } catch (error) {
    console.error('GET PAWN BY ID ERROR:', error);
    res.status(500).json({ message: 'Server error' });
  }
};


exports.updatePawnTicket = async (req, res) => {
  try {
    const updatedTicket = await PawnTicket.findOneAndUpdate(
      { _id: req.params.id, shop_id: req.user.shopId },
      req.body, // Use all fields from the form
      { new: true, runValidators: true } // Return the updated doc
    );

    if (!updatedTicket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    res.status(200).json({
      message: 'Ticket updated',
      ticket: updatedTicket
    });
  } catch (error) {
    console.error('UPDATE PAWN TICKET ERROR:', error);
    res.status(500).json({ message: 'Server error' });
  }
};


exports.deletePawnTicket = async (req, res) => {
  try {
    const { id } = req.params;
    const { shopId } = req.user;

    // First, delete all payments associated with this ticket
    await Payment.deleteMany({
      ticket_id: id,
      shop_id: shopId
    });

    // Then, delete the ticket itself
    const deletedTicket = await PawnTicket.findOneAndDelete({
      _id: id,
      shop_id: shopId
    });

    if (!deletedTicket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    await logActivity({
      shopId: shopId,
      userId: req.user.userId,
      type: 'DELETED_TICKET',
      message: `Deleted ticket ${deletedTicket.ticket_number}`,
      ticketId: deletedTicket._id,
    });

    res.status(200).json({ message: 'Ticket and associated payments deleted' });
  } catch (error) {
    console.error('DELETE PAWN TICKET ERROR:', error);
    res.status(500).json({ message: 'Server error' });
  }
};


exports.settlePawnTicket = async (req, res) => {
  try {
    const ticket = await PawnTicket.findOne({
      _id: req.params.id,
      shop_id: req.user.shopId
    });

    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
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

    res.status(200).json({ message: 'Ticket settled', ticket: savedTicket });
  } catch (error) {
    console.error('SETTLE TICKET ERROR:', error);
    res.status(500).json({ message: 'Server error' });
  }
};


exports.getPawnTicketsForCustomer = async (req, res) => {
  try {
    const { id } = req.params;

    const tickets = await PawnTicket.find({
      shop_id: req.user.shopId,
      customer_id: id
    })
    .populate('customer_id', 'full_name')
    .sort({ pawned_date: -1 });

    res.status(200).json({
      count: tickets.length,
      tickets,
    });

  } catch (error) {
    console.error('GET PAWN TICKETS FOR CUSTOMER ERROR:', error);
    res.status(500).json({ message: 'Server error' });
  }
};