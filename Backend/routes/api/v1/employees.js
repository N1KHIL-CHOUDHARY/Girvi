const express = require('express');
const router = express.Router();

const {
  listEmployees,
  createEmployee,
  updateEmployee,
  deleteEmployee,
} = require('../../../controllers/employee');
router.get('/', listEmployees);
router.post('/', createEmployee);
router.patch('/:employeeId', updateEmployee);
router.delete('/:employeeId', deleteEmployee);

module.exports = router;
