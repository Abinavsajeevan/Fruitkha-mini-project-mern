const express = require('express');
const router = express.Router();
const passport = require('passport');
const {verifyToken, verifyTokenIndex} = require('../middleware/authMiddleware');
const { googleLogin, resendOtp, logout, deleteAccount, getShop, getCart, getWishlist, getCheckout, addressProfile } = require('../controller/userAuthController');
const { adminVerifyToken } = require('../middleware/adminAuthMiddleware');
const Admin = require('../models/Admin');
const { logoutAdmin } = require('../controller/adminAuthController');
const Product = require('../models/Product');
//=================================================

//------------------USER SIDE----------------------

// ======================================================
//index page
router.get('/', verifyTokenIndex, async (req, res) => { 
    req.session.email = null;
    const getProducts = await Product.find().limit(3);
    res.render('user/index', {user: req.user, products: getProducts});
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

//---------------about  page----------------------

router.get('/about', verifyTokenIndex, async (req, res) => { 
    req.session.email = null;    
    res.render('user/about', {user: req.user, });
})
//------------contact page----------
router.get('/contact', verifyTokenIndex, async (req, res) => { 
    req.session.email = null;
    res.render('user/contact', {user: req.user});
})

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
router.get('/profileAddress', verifyToken, addressProfile)

//profile setting
router.get('/profileSetting', verifyToken, (req, res) => {
  req.session.email = req.user.email;
  res.render('user/profileSetting', {user: req.user, error: null,
        showChangePasswordModal: false, success: false});
})

//logout
router.get('/logout', verifyToken, logout)


///=======================================================

//---------------shop page----------------------

 router.get('/shop', verifyToken, getShop)


///=======================================================

//---------------cart page----------------------

 router.get('/cart', verifyToken, getCart)

///=======================================================

//---------------wishlist page----------------------

 router.get('/wishlist', verifyToken, getWishlist)

///=======================================================

//---------------checkout page----------------------
router.get('/checkout', verifyToken, getCheckout)


///=======================================================

//  ----------[passsport]-------------
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
router.get('/admin', adminVerifyToken, (req, res) => {
    console.log('dash ', req.session.email)
    
    res.render('admin/index',{admin: req.admin} )
})

//--------------------------------------
//----------admin setting page -------------
//---------------------------------------

//admin settings
router.get('/admin/settings',adminVerifyToken, (req, res) => {
    console.log('sett ', req.session.email)
  res.render('admin/settings' ,{admin: req.admin, errors: [{msg: 'updated successfully' , path:`${req.query.success}`}]})
})

//logout 
router.get('/admin/logout', adminVerifyToken, logoutAdmin)

//--------------------------------------
//----------admin product page -------------
//---------------------------------------
router.get('/admin/products', adminVerifyToken, async(req, res) => {
  const getProducts = await Product.find();
  res.render('admin/products',  {showAddProductModal :false, products: getProducts, showEditProductModal : false, errors: [], prod: false})
})
//edit button
router.get('/admin/products/edit/:id', async(req, res) => {
  const product = await Product.findById(req.params.id)
   const getProducts = await Product.find();
  if(!product) return res.redirect('/admin/products');
  res.render('admin/products',  {showAddProductModal :false, products: getProducts, showEditProductModal : true, errors: [], prod: product})
})


module.exports = router;