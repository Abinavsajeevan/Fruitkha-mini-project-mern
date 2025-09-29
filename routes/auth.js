const express = require('express');
const { registerUser, loginUser } = require('../controller/authController');
const { signupValidation, loginValidation } = require('../middleware/userValidator');
const router = express.Router();

router.post('/signup', signupValidation, registerUser);
router.post('/login',loginValidation, loginUser)

module.exports = router