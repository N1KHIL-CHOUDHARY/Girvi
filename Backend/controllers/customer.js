const Customer = require('../models/customer.js');
const { logActivity } = require('../services/activityLogger.js');


exports.createCustomer = async (req, res) => {
  const { full_name, phone_number, address, gender, customer_photo_url, aadhaar_number, pan_number } = req.body;

  try {
    const newCustomer = new Customer({
      full_name,
      phone_number,
      address,
      gender,
      customer_photo_url,
      aadhaar_number,
      pan_number,
      shop_id: req.user.shopId,
      created_by_user_id: req.user.userId
    });

    const savedCustomer = await newCustomer.save();
    
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

    
    const query = {
      shop_id: req.user.shopId,
    };
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
      _id: req.params.id,       // Find the customer by the ID in the URL
      shop_id: req.user.shopId  // Ensure they belong to the logged-in user's shop
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