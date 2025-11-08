const express = require('express');
const router = express.Router();
const authRoutes = require('./auth');
const customerRoutes = require('./customers');
const pawnRoutes = require('./pawns');
const analyticsRoutes = require('./analytics');
const appRoutes = require('./app');

router.get('/', (req, res) => {
  res.json({ message: 'Welcome to PawnManager API v1' });
});


router.use('/auth', authRoutes);
router.use('/app', appRoutes);      
router.use('/app/customers', customerRoutes);
router.use('/app/pawns', pawnRoutes);

router.use('/app', analyticsRoutes);

module.exports = router;