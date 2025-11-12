const User = require('../models/user');
const Role = require('../models/role');
const {
  DEFAULT_ROLE_PERMISSIONS,
  normalizeRoleName,
} = require('../utils/roleHelpers');

const ensureShopContext = (req, res) => {
  if (!req.user || !req.user.shopId) {
    res.status(400).json({ message: 'Shop context missing from request' });
    return null;
  }
  return req.user.shopId;
};

const getOrCreateWorkerRole = async (shopId) => {
  let role = await Role.findOne({ shop_id: shopId, name: normalizeRoleName('worker') });
  if (!role) {
    role = await Role.create({
      shop_id: shopId,
      name: normalizeRoleName('worker'),
      is_owner_role: false,
      permissions: DEFAULT_ROLE_PERMISSIONS.worker,
    });
  }
  return role;
};

exports.listEmployees = async (req, res) => {
  const shopId = ensureShopContext(req, res);
  if (!shopId) return;

  try {
    const employees = await User.find({ shop_id: shopId, role: 'worker' })
      .select('_id full_name email role role_id shop_id createdAt updatedAt');
    res.status(200).json(employees);
  } catch (error) {
    console.error('LIST EMPLOYEES ERROR:', error);
    res.status(500).json({ message: 'Failed to fetch employees' });
  }
};

exports.createEmployee = async (req, res) => {
  const shopId = ensureShopContext(req, res);
  if (!shopId) return;

  const { full_name, email, password, roleId } = req.body || {};
  if (!full_name || !email || !password) {
    return res.status(400).json({ message: 'full_name, email and password are required' });
  }

  try {
    const existing = await User.findOne({ shop_id: shopId, email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({ message: 'Email already in use' });
    }

    let roleDoc = null;
    if (roleId) {
      roleDoc = await Role.findOne({ _id: roleId, shop_id: shopId });
      if (!roleDoc) {
        return res.status(400).json({ message: 'Invalid role for this shop' });
      }
    } else {
      roleDoc = await getOrCreateWorkerRole(shopId);
    }

    const user = await User.create({
      shop_id: shopId,
      full_name,
      email: email.toLowerCase(),
      password,
      role: roleDoc && roleDoc.is_owner_role ? 'owner' : 'worker',
      role_id: roleDoc ? roleDoc._id : undefined,
    });

    res.status(201).json({
      id: user._id,
      full_name: user.full_name,
      email: user.email,
      role: user.role,
      role_id: user.role_id,
    });
  } catch (error) {
    console.error('CREATE EMPLOYEE ERROR:', error);
    res.status(500).json({ message: 'Failed to create employee' });
  }
};

exports.updateEmployee = async (req, res) => {
  const shopId = ensureShopContext(req, res);
  if (!shopId) return;

  const { employeeId } = req.params;
  const { full_name, email, password, roleId } = req.body || {};

  if (!employeeId) {
    return res.status(400).json({ message: 'Employee identifier is required' });
  }

  try {
    const user = await User.findOne({ _id: employeeId, shop_id: shopId });
    if (!user) {
      return res.status(404).json({ message: 'Employee not found' });
    }
    if (user.role === 'owner') {
      return res.status(400).json({ message: 'Owner cannot be modified via employee APIs' });
    }

    if (full_name) user.full_name = full_name;
    if (email) user.email = email.toLowerCase();
    if (password) user.password = password;

    if (roleId) {
      const roleDoc = await Role.findOne({ _id: roleId, shop_id: shopId });
      if (!roleDoc) {
        return res.status(400).json({ message: 'Invalid role for this shop' });
      }
      user.role_id = roleDoc._id;
      user.role = roleDoc.is_owner_role ? 'owner' : 'worker';
    }

    await user.save();

    res.status(200).json({
      id: user._id,
      full_name: user.full_name,
      email: user.email,
      role: user.role,
      role_id: user.role_id,
    });
  } catch (error) {
    console.error('UPDATE EMPLOYEE ERROR:', error);
    res.status(500).json({ message: 'Failed to update employee' });
  }
};

exports.deleteEmployee = async (req, res) => {
  const shopId = ensureShopContext(req, res);
  if (!shopId) return;

  const { employeeId } = req.params;
  if (!employeeId) {
    return res.status(400).json({ message: 'Employee identifier is required' });
  }

  try {
    const user = await User.findOne({ _id: employeeId, shop_id: shopId });
    if (!user) {
      return res.status(404).json({ message: 'Employee not found' });
    }
    if (user.role === 'owner') {
      return res.status(400).json({ message: 'Owner cannot be deleted' });
    }

    await user.deleteOne();
    res.status(200).json({ message: 'Employee deleted successfully' });
  } catch (error) {
    console.error('DELETE EMPLOYEE ERROR:', error);
    res.status(500).json({ message: 'Failed to delete employee' });
  }
};
