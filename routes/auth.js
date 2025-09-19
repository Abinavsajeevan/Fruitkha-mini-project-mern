const express = require('express');
const { registerUser } = require('../controller/authController');
const { signupValidation } = require('../middleware/userValidator');
const router = express.Router();

router.post('/signup', signupValidation, registerUser);

module.exports = router