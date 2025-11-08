const Activity = require('../models/activity.js');


exports.logActivity = async (options) => {
  try {
    const activity = new Activity({
      shop_id: options.shopId,
      user_id: options.userId,
      type: options.type,
      message: options.message,
      customer_id: options.customerId,
      ticket_id: options.ticketId,
    });
    await activity.save();
  } catch (error) {
    // We log the error but don't stop the main request
    console.error('Activity logging failed:', error);
  }
};