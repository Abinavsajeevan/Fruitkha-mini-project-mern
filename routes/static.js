const express = require('express');
const router = express.Router();
const passport = require('passport');
const {verifyToken, verifyTokenIndex} = require('../middleware/authMiddleware');
const { googleLogin, resendOtp, logout, deleteAccount } = require('../controller/userAuthController');
const { adminVerifyToken } = require('../middleware/adminAuthMiddleware');
const Admin = require('../models/Admin');
//=================================================

//------------------USER SIDE----------------------

// ======================================================
//index page
router.get('/', verifyTokenIndex, (req, res) => { 
    req.session.email = null;
    res.render('user/index', {user: req.user});
})

//-----------------user without login-------------------
///=======================================================

//login page 
router.get('/login', (req, res) => {

  req.session.email = null;
    res.render('user/login', {errors : [], user: null});
})

//sign up page
router.get('/signup', (req, res) => {
    res.render('user/signup', {errors: [], user: null});
})

// forgot password
router.get('/forgotPassword', (req, res) => {
  res.render('user/forgotPassword', {errors: []})
})

//verify
router.get('/verifyOtp', (req, res) => {
  res.render('user/verifyOtp', {errors: []})
})

//reset password
router.get('/resetPassword', (req, res) => {
  res.render('user/resetPassword', {errors: []})
})
//resend otp
router.get("/resend-otp", resendOtp);


//-----------------user with login-------------------
///=======================================================

//---------------profile page----------------------

//profile info
router.get('/profile',verifyToken, (req, res) => {
  req.session.email =  req.user.email
  res.render('user/profile', {user: req.user, error: null,
        showEditProfileModal : false, success: false})
})

//profile order
router.get('/profileOrder', verifyToken, (req, res) => {
  res.render('user/profileOrder', {user: req.user})
})

//profile address
router.get('/profileAddress', verifyToken, (req, res) => {
  res.render('user/profileAddress', {user: req.user})
})

//profile setting
router.get('/profileSetting', verifyToken, (req, res) => {
  req.session.email = req.user.email;
  res.render('user/profileSetting', {user: req.user, error: null,
        showChangePasswordModal: false, success: false});
})

//logout
router.get('/logout', verifyToken, logout)






// it is for passport js
router.get('/auth/google/signup', passport.authenticate('google-signup', { scope: ['profile', 'email'] }));

// callback route
router.get('/auth/google/signup/callback',
  passport.authenticate('google-signup', { failureRedirect: '/signup', failureFlash: true }),
  (req, res) => {
    // Successful register
    res.redirect('/login'); 
  }
);
// it is for passport js for login
router.get('/auth/google/login', passport.authenticate('google-login', { scope: ['profile', 'email'] }));

// callback route for login
router.get('/auth/google/login/callback',
  passport.authenticate('google-login', { failureRedirect: '/login', failureFlash: true }),
  googleLogin
);



//=====================================================================================

//====================== ADMIN PAGES ========================   

//========================================================================

router.get('/admin/login', (req, res) => {
  res.render('admin/adminLogin', {errors: []})
})

//admin dash or index page
router.get('/admin', adminVerifyToken,async (req, res) => {
    console.log('dash ', req.session.email)
    
    res.render('admin/index',{admin: req.admin} )
})

//admin settings
router.get('/admin/settings',adminVerifyToken, (req, res) => {
    console.log('sett ', req.session.email)

  res.render('admin/settings' ,{admin: req.admin, errors: []})
})


module.exports = router;