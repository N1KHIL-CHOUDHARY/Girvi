const express = require('express');
const router = express.Router();

const {
  getRoles,
  createRole,
  updateRole,
  deleteRole,
} = require('../../../controllers/role');
router.get('/', getRoles);
router.post('/', createRole);
router.patch('/:roleId', updateRole);
router.delete('/:roleId', deleteRole);

module.exports = router;

