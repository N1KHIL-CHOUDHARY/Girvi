const Customer = require('../models/customer.js');
const PawnTicket = require('../models/pawnTicket.js');
const { logActivity } = require('../services/activityLogger.js');

exports.createCustomer = async (req, res) => {
  const { full_name, phone_number, address, gender, customer_photo_url, aadhaar_number, pan_number } = req.body;
  const { shopId, userId } = req.user; // Get from auth middleware

  try {
    const newCustomer = new Customer({
      full_name, phone_number, address, gender, customer_photo_url, aadhaar_number, pan_number,
      shop_id: shopId,
      created_by_user_id: userId
    });

    const savedCustomer = await newCustomer.save();
    
    // --- ADD THIS LOG ---
    await logActivity({
      shopId, userId, type: 'NEW_CUSTOMER',
      message: `Created new customer: ${savedCustomer.full_name}`,
      customerId: savedCustomer._id,
    });
    // --------------------

    res.status(201).json({
      message: 'Customer created successfully',
      customer: savedCustomer,
    });

  } catch (error) {
    console.error('CREATE CUSTOMER ERROR:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getCustomers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10; 
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

    res.status(200).json({
      totalCustomers,
      totalPages: Math.ceil(totalCustomers / limit),
      currentPage: page,
      customers,
    });
  } catch (error) {
    console.error('GET CUSTOMERS ERROR:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getCustomerById = async (req, res) => {
  try {
    const customer = await Customer.findOne({ 
      _id: req.params.id,
      shop_id: req.user.shopId
    });
    
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }
    res.status(200).json(customer);
  } catch (error) {
    console.error('GET CUSTOMER BY ID ERROR:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateCustomer = async (req, res) => {
  try {
    const updatedCustomer = await Customer.findOneAndUpdate(
      { _id: req.params.id, shop_id: req.user.shopId },
      req.body,
      { new: true, runValidators: true }
    );

    if (!updatedCustomer) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    // --- ADD THIS LOG ---
    await logActivity({
      shopId: req.user.shopId,
      userId: req.user.userId,
      type: 'UPDATED_CUSTOMER',
      message: `Updated customer details for: ${updatedCustomer.full_name}`,
      customerId: updatedCustomer._id,
    });
    // --------------------

    res.status(200).json({
      message: 'Customer updated',
      customer: updatedCustomer
    });
  } catch (error) {
    console.error('UPDATE CUSTOMER ERROR:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.deleteCustomer = async (req, res) => {
  try {
    const { id } = req.params;
    const { shopId, userId } = req.user;

    await PawnTicket.deleteMany({ 
      customer_id: id, // Use customer_id
      shop_id: shopId 
    });
    // (We'll also need to delete payments)
    await Payment.deleteMany({
      customer_id: id,
      shop_id: shopId
    });

    const deletedCustomer = await Customer.findOneAndDelete({ 
      _id: id, 
      shop_id: shopId 
    });

    if (!deletedCustomer) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    // --- ADD THIS LOG ---
    await logActivity({
      shopId, userId, type: 'DELETED_CUSTOMER',
      message: `Deleted customer: ${deletedCustomer.full_name}`,
      customerId: deletedCustomer._id,
    });
    // --------------------

    res.status(200).json({ message: 'Customer and all associated tickets/payments deleted' });
  } catch (error) {
    console.error('DELETE CUSTOMER ERROR:', error);
    res.status(500).json({ message: 'Server error' });
  }
};