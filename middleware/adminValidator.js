const { body, validationResult } = require('express-validator');
const Admin = require('../models/Admin');
const adminLoginValidation = [
    body('email')
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email address'),

    body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 6, max: 15 }).withMessage('password must be beween 6 and 15 characters'),

    (req, res, next) => {
        const errors = validationResult(req);

        if(!errors.isEmpty()) {


            return res.render('admin/adminLogin', {errors: errors.array()})
        }
        next()
    }
]

const adminSettingValidation = [
    body('name')
    .notEmpty().withMessage('Name is required')
    .isLength({min: 3, max: 50}).withMessage('Name length should be 3 and maximum 15 length'),

    body('email')
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email address'),

    body('password')
    .notEmpty().withMessage('password must be required')
    .isLength({min: 6, max: 15}).withMessage('Password must be between 6 and 15 characters'),

   async (req, res, next) => {
        const errors = validationResult(req);
        console.log('session email:-',req.session.email)
        const admin = await Admin.findOne({email: req.session.email})
        // req.admin = admin.toObject();
        if(!errors.isEmpty()) {

            return res.render('admin/settings', {errors: errors.array(), admin:admin})
        }
        next()
    }
]
module.exports = {
    adminLoginValidation,
    adminSettingValidation
}