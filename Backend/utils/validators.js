const Joi = require('joi');

const signupSchema = Joi.object({
  shop_name: Joi.string().min(3).max(100).required(),
  full_name: Joi.string().min(3).max(100).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

const customerSchema = Joi.object({
  full_name: Joi.string().min(3).max(100).required(),
  phone_number: Joi.string().min(10).max(15).required(),
  gender: Joi.string().valid('Male', 'Female', 'Other').optional(),
  address: Joi.object({
    line1: Joi.string().optional().allow(''),
    city: Joi.string().optional().allow(''),
    pincode: Joi.string().optional().allow(''),
  }).optional(),
  customer_photo_url: Joi.string().uri().optional().allow(''),
  aadhaar_number: Joi.string().optional().allow(''),
  pan_number: Joi.string().optional().allow(''),
});

const itemSchema = Joi.object({
  name: Joi.string().required(),
  type: Joi.string().optional(),
  weight_grams: Joi.number().min(0).required(),
  purity: Joi.number().optional(),
  description: Joi.string().optional().allow(''),
  item_photo_url: Joi.string().uri().optional().allow(''),
});

const pawnTicketSchema = Joi.object({
  customer_id: Joi.string().hex().length(24).required(), 
  ticket_number: Joi.string().min(1).required(),
  loan_amount: Joi.number().min(1).required(),
  interest_rate: Joi.number().min(0).required(),
  adv_amount: Joi.number().min(0).required(),
  pawned_date: Joi.date().optional(),
  items: Joi.array().items(itemSchema).min(1).required(),
});

module.exports = {
  signupSchema,
  loginSchema,
  customerSchema,
  pawnTicketSchema,
};