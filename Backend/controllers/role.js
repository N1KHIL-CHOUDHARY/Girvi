const Role = require('../models/role');
const User = require('../models/user');
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

exports.getRoles = async (req, res) => {
  const shopId = ensureShopContext(req, res);
  if (!shopId) {
    return;
  }

  try {
    const roles = await Role.find({ shop_id: shopId }).sort({
      is_owner_role: -1,
      createdAt: 1,
    });

    res.status(200).json(roles);
  } catch (error) {
    console.error('GET ROLES ERROR:', error);
    res.status(500).json({ message: 'Failed to fetch roles' });
  }
};

exports.createRole = async (req, res) => {
  const shopId = ensureShopContext(req, res);
  if (!shopId) {
    return;
  }

  const { name, permissions = {} } = req.body || {};

  if (!name) {
    return res.status(400).json({ message: 'Role name is required' });
  }

  const normalizedName = normalizeRoleName(name.trim());

  if (!normalizedName) {
    return res.status(400).json({ message: 'Role name is invalid' });
  }

  if (normalizedName.toLowerCase() === 'owner') {
    return res.status(400).json({ message: 'Owner role already exists' });
  }

  try {
    const existingRole = await Role.findOne({
      shop_id: shopId,
      name: normalizedName,
    });

    if (existingRole) {
      return res.status(409).json({ message: 'Role name already in use' });
    }

    const role = await Role.create({
      shop_id: shopId,
      name: normalizedName,
      is_owner_role: false,
      permissions: {
        ...DEFAULT_ROLE_PERMISSIONS.worker,
        ...permissions,
      },
    });

    res.status(201).json(role);
  } catch (error) {
    console.error('CREATE ROLE ERROR:', error);
    res.status(500).json({ message: 'Failed to create role' });
  }
};

exports.updateRole = async (req, res) => {
  const shopId = ensureShopContext(req, res);
  if (!shopId) {
    return;
  }

  const { roleId } = req.params;
  const { name, permissions } = req.body || {};

  if (!roleId) {
    return res.status(400).json({ message: 'Role identifier is required' });
  }

  try {
    const role = await Role.findOne({ _id: roleId, shop_id: shopId });

    if (!role) {
      return res.status(404).json({ message: 'Role not found' });
    }

    if (role.is_owner_role) {
      return res.status(400).json({ message: 'Owner role cannot be updated' });
    }

    if (name) {
      const normalizedName = normalizeRoleName(name.trim());
      if (!normalizedName) {
        return res.status(400).json({ message: 'Role name is invalid' });
      }

      const duplicate = await Role.findOne({
        _id: { $ne: roleId },
        shop_id: shopId,
        name: normalizedName,
      });

      if (duplicate) {
        return res.status(409).json({ message: 'Role name already in use' });
      }

      role.name = normalizedName;
    }

    if (permissions && typeof permissions === 'object') {
      role.permissions = {
        ...DEFAULT_ROLE_PERMISSIONS.worker,
        ...permissions,
      };
    }

    await role.save();

    res.status(200).json(role);
  } catch (error) {
    console.error('UPDATE ROLE ERROR:', error);
    res.status(500).json({ message: 'Failed to update role' });
  }
};

exports.deleteRole = async (req, res) => {
  const shopId = ensureShopContext(req, res);
  if (!shopId) {
    return;
  }

  const { roleId } = req.params;

  if (!roleId) {
    return res.status(400).json({ message: 'Role identifier is required' });
  }

  try {
    const role = await Role.findOne({ _id: roleId, shop_id: shopId });

    if (!role) {
      return res.status(404).json({ message: 'Role not found' });
    }

    if (role.is_owner_role) {
      return res.status(400).json({ message: 'Owner role cannot be deleted' });
    }

    const usersUsingRole = await User.countDocuments({ role_id: roleId });

    if (usersUsingRole > 0) {
      return res
        .status(409)
        .json({ message: 'Role is assigned to users and cannot be deleted' });
    }

    await role.deleteOne();

    res.status(200).json({ message: 'Role deleted successfully' });
  } catch (error) {
    console.error('DELETE ROLE ERROR:', error);
    res.status(500).json({ message: 'Failed to delete role' });
  }
};

