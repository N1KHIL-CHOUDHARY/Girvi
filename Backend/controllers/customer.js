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
    const customers = await Customer.find({ shop_id: req.user.shopId })
      .sort({ createdAt: -1 });

    res.status(200).json({
      count: customers.length,
      customers,
    });

  } catch (error) {
    console.error('GET CUSTOMERS ERROR:', error);
    res.status(500).json({ message: 'Server error' });
  }
};