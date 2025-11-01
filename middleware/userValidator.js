const { body, validationResult } = require('express-validator');
const Address = require('../models/Address');

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

const loginValidation = [
 body('user')
  .notEmpty().withMessage('email or mobile is required')
  .custom(value => {
    const isEmail = /\S+@\S+\.\S+/.test(value);
    const isMobile = /^[0-9]{10,13}$/.test(value);
    if (!isEmail && !isMobile) {
      throw new Error('Must be a valid email or mobile number');
    }
    return true;
  }),
  
  body('password')
    .notEmpty().withMessage('Password is required')
];

const forgotValidation = [
  body('email')
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email address')
]

const resetPasswordValidation = [
  body('password')
   .notEmpty().withMessage('Password is required')
    .isLength({ min: 6, max: 15 }).withMessage('Password must be between 6 and 15 characters'),
    body('confirmPassword')
     .notEmpty().withMessage('confirmPassword is required')
    .isLength({ min: 6, max: 15 }).withMessage('Password must be between 6 and 15 characters')
]

const addressValidation = [
  body('label')
    .trim()
    .notEmpty().withMessage('Label is required')
    .isLength({ min: 3 }).withMessage('Label must be at least 3 characters'),

  body('street')
    .trim()
    .notEmpty().withMessage('Street is required'),

  body('city')
    .trim()
    .notEmpty().withMessage('City is required'),

  body('district')
    .trim()
    .notEmpty().withMessage('District is required'),

  body('country')
    .trim()
    .notEmpty().withMessage('Country is required'),

  body('pincode')
    .trim()
    .notEmpty().withMessage('Pincode is required')
    .isPostalCode('IN').withMessage('Invalid Indian pincode'),

  body('phone')
    .trim()
    .notEmpty().withMessage('Phone number is required')
    .matches(/^[6-9]\d{9}$/).withMessage('Invalid Indian phone number'),

    async (req, res, next) => {
      const errors = validationResult(req);
      const userId = req.user._id
 const isDefAddress = await Address.findOne({userId, isDefault: true});
    const address = await Address.find(
      {
        userId,
        _id:{ $ne: isDefAddress._id}
      }
    );
      if(!errors.isEmpty()) {
           return res.render('user/profileAddress', {errors: errors.array(), user: req.user, showAddAddressModal: true, showEditAddressModal: false, address, data:null, def: isDefAddress})

      }
      next()
    }
];
const addressEditValidation = [
  body('label')
    .trim()
    .notEmpty().withMessage('Label is required')
    .isLength({ min: 3 }).withMessage('Label must be at least 3 characters'),

  body('street')
    .trim()
    .notEmpty().withMessage('Street is required'),

  body('city')
    .trim()
    .notEmpty().withMessage('City is required'),

  body('district')
    .trim()
    .notEmpty().withMessage('District is required'),

  body('country')
    .trim()
    .notEmpty().withMessage('Country is required'),

  body('pincode')
    .trim()
    .notEmpty().withMessage('Pincode is required')
    .isPostalCode('IN').withMessage('Invalid Indian pincode'),

  body('phone')
    .trim()
    .notEmpty().withMessage('Phone number is required')
    .matches(/^[6-9]\d{9}$/).withMessage('Invalid Indian phone number'),

    async (req, res, next) => {
      const errors = validationResult(req);
      const userId = req.user._id
 const isDefAddress = await Address.findOne({userId, isDefault: true});
    const address = await Address.find(
      {
        userId,
        _id:{ $ne: isDefAddress._id}
      }
    );

      const existingAddress = await Address.findOne({userId})
      if(!errors.isEmpty()) {
           return res.render('user/profileAddress', {errors: errors.array(), user: req.user, showAddAddressModal:false, showEditAddressModal: true, address, data: existingAddress, def: isDefAddress})

      }
      next()
    }
];



module.exports =  {
  signupValidation,
  loginValidation,
  forgotValidation,
  resetPasswordValidation,
  addressValidation,
  addressEditValidation
} ;
