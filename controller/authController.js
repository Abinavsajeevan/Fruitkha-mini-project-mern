const User = require('../models/User');
const {validationResult} = require('express-validator');
const bcrypt = require('bcrypt');
const passport = require('passport');
const jwt = require('jsonwebtoken')


// registration 
const registerUser = async (req, res) => {
    console.log('registration started...')
    const errors =await validationResult(req);
    if( !errors.isEmpty() ) {
        return res.render('user/signup', { errors: errors.array(), user:null })
    }
    try {
        const { name,  email, mobile, password, terms} =  req.body;
        if(terms !== 'on') {
            return res.render('user/signup', {errors:  [{msg: `please accept out terms and conditions`, path: 'terms'}]})
        }
        // check if emailExist
        const emailExist = await User.findOne({ email: email.toLowerCase() })
       if(emailExist) {
            let msg = emailExist.provider === 'google'
                ? 'This email is already registered via Google. Please login with Google.'
                : 'This email is already registered';
            return res.render('user/signup', { errors: [{msg, path: 'email'}] });
        }

        // check if mobile exist
        const mobileExist = await User.findOne( { mobile });
        if( mobileExist ) return res.render('user/signup', {errors: [{msg: 'already registered mobile', path: 'mobile'}]});
        // create hashpassword
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt);
        console.log('new user creating...')
        // creating user
        const user = await User.create({
            name,
            email,
            mobile,
            password: hashedPassword
        });
        
        if(user) {
             return res.redirect('/login');
        } else {
            res.status(400);
        }


    }catch(err) {
        console.log('register error: ', err)
    }
}

// login
const loginUser = async (req, res) => {
    console.log('login started...')
    const errors =await validationResult(req);
    if( !errors.isEmpty() ) {
        console.log('an error occured...')
        return res.render('user/login', {errors: errors.array(), user: null})
    }
    try {
        const userEmail = await User.findOne({email: req.body.user});
        const userMobile= await User.findOne({mobile: req.body.user});
        const user = userEmail || userMobile;
        // if not registered yet 
        if(!user) return res.render('user/login', {errors: [{msg:'user not registered yet, please sign in', path: 'no_user'}], user: null});

        // if registered only through google
        if(user.password === null) return res.render('user/login', {errors: [{msg:'this account is register with google.', path: 'google'}], user: null});

        // checking user is blocked by admin
        if(user.isBlocked === true) return res.render('user/login', {errors: [{msg: 'This user is blocked', path: 'block'}], user: null},);

        //checking  password matching 
        const result = await bcrypt.compare(req.body.password, user.password);

        if(!result) return res.render('user/login', {errors: [{msg: 'Password mismatch❌', path: 'password'}], user: null});
        console.log('user verified now creating jwt token...')
        // create jwt token for authentication
        const token = jwt.sign({tokenId: user._id}, process.env.JWT_SECRET_KEY, )
        // storing token in cookie
        console.log('storing token in to cookie...')
        res.cookie("token", token, { httpOnly: true, maxAge: 24 * 60 * 60 * 1000 , sameSite: 'strict'});
        console.log('login completed....')
        res.redirect('/');
        
    }catch(err) {
        console.log('login error: ', err);
    }
}

module.exports = {
    registerUser,
    loginUser
}