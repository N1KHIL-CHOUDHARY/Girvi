const express = require('express');
const router = express.Router();

const {
  getRoles,
  createRole,
  updateRole,
  deleteRole,
} = require('../../../controllers/role');
const {
  authenticate,
  checkPermission,
} = require('../../../middlewares/auth');

router.use(authenticate);

router.get('/', getRoles);
router.post('/', checkPermission('can_manage_roles'), createRole);
router.patch('/:roleId', checkPermission('can_manage_roles'), updateRole);
router.delete('/:roleId', checkPermission('can_manage_roles'), deleteRole);

module.exports = router;

