const { body } = require('express-validator');

const signupValidation = [
  body('name')
    .notEmpty().withMessage('Name is required')
    .isLength({ min: 3, max: 50 }).withMessage('Name must be between 3 and 50 characters'),

  body('email')
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email address'),

  body('mobile')
    .notEmpty().withMessage('Mobile number is required')
    .isNumeric().withMessage('Mobile number must contain only digits')
    .isLength({ min: 10, max: 13 }).withMessage('Mobile number must be between 10 and 13 digits'),

  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 6, max: 15 }).withMessage('Password must be between 6 and 15 characters'),

  body('confirm')
    .custom((value, { req }) => value === req.body.password)
    .withMessage('Passwords do not match')
];

module.exports =  {signupValidation} ;
