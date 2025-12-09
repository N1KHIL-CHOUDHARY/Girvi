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
  authorize,
} = require('../../../middlewares/auth');

router.use(authenticate);

router.get('/', authorize('owner'), listEmployees);
router.post('/', authorize('owner'), createEmployee);
router.patch('/:employeeId', authorize('owner'), updateEmployee);
router.delete('/:employeeId', authorize('owner'), deleteEmployee);

module.exports = router;
