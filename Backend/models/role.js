const mongoose = require('mongoose');

const { Schema } = mongoose;

const permissionsSchema = new Schema(
  {
    can_view_dashboard: { type: Boolean, default: false },
    can_view_customers: { type: Boolean, default: false },
    can_create_customers: { type: Boolean, default: false },
    can_edit_customers: { type: Boolean, default: false },
    can_delete_customers: { type: Boolean, default: false },
    can_view_tickets: { type: Boolean, default: false },
    can_create_tickets: { type: Boolean, default: false },
    can_settle_tickets: { type: Boolean, default: false },
    can_delete_tickets: { type: Boolean, default: false },
    can_manage_employees: { type: Boolean, default: false },
    can_manage_roles: { type: Boolean, default: false },
    can_view_reports: { type: Boolean, default: false },
  },
  { _id: false }
);

const roleSchema = new Schema(
  {
    shop_id: {
      type: Schema.Types.ObjectId,
      ref: 'Shop',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    is_owner_role: {
      type: Boolean,
      default: false,
    },
    permissions: {
      type: permissionsSchema,
      default: () => ({}),
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Role', roleSchema);
