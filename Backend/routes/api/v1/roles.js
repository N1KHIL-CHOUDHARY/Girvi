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
  authorize,
} = require('../../../middlewares/auth');

router.use(authenticate);

router.get('/', getRoles);
router.post('/', authorize('owner'), createRole);
router.patch('/:roleId', authorize('owner'), updateRole);
router.delete('/:roleId', authorize('owner'), deleteRole);

module.exports = router;

