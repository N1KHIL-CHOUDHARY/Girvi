const express = require('express');
const router = express.Router();

const {
  listEmployees,
  createEmployee,
  updateEmployee,
  deleteEmployee,
} = require('../../../controllers/employee');
const {
  authenticate,
  checkPermission,
} = require('../../../middlewares/auth');

router.use(authenticate);

router.get('/', checkPermission('can_manage_employees'), listEmployees);
router.post('/', checkPermission('can_manage_employees'), createEmployee);
router.patch('/:employeeId', checkPermission('can_manage_employees'), updateEmployee);
router.delete('/:employeeId', checkPermission('can_manage_employees'), deleteEmployee);

module.exports = router;
