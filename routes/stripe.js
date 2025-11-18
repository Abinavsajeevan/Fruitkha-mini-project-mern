const express = require('express');
const { verifyToken } = require('../middleware/authMiddleware');
const { getStripe, postStripe, stripeSuccess } = require('../controller/userAuthController');
const router = express.Router();

router.get('/payment/:orderId', verifyToken, getStripe);
router.post('/webhook', express.raw({ type: 'application/json' }), postStripe)
router.get('/order/success/:sessionId',verifyToken, stripeSuccess)
router.get('/checkout/cancel', (req, res) => {
    res.redirect("/")
});

module.exports = router