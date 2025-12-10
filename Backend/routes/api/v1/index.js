const express = require('express');
const router = express.Router();
const authRoutes = require('./auth');
const customerRoutes = require('./customers');
const pawnRoutes = require('./pawns');
const employeeRoutes = require('./employees');
const analyticsRoutes = require('./analytics');
const appRoutes = require('./app');
const roleRoutes = require('./roles');
const uploadRoutes = require('./upload');
const paymentRoutes = require('./payments');

router.get('/', (req, res) => {
  res.json({ message: 'Welcome to PawnManager API v1' });
});


router.use('/auth', authRoutes);
router.use('/app/roles', roleRoutes);
router.use('/app', appRoutes);      
router.use('/app/customers', customerRoutes);
router.use('/app/employees', employeeRoutes);
router.use('/app/pawns', pawnRoutes);
router.use('/app/upload', uploadRoutes);
router.use('/app/payments', paymentRoutes);

router.use('/app/stat', analyticsRoutes);

module.exports = router;