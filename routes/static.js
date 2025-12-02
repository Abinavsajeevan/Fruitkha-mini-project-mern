const express = require('express');
const router = express.Router();
const passport = require('passport');
const {verifyToken, verifyTokenIndex} = require('../middleware/authMiddleware');
const { googleLogin, resendOtp, logout, deleteAccount, getShop, getCart, getWishlist, getCheckout, addressProfile, orderCOD, getProfileOrder, getSingleProduct } = require('../controller/userAuthController');
const { adminVerifyToken } = require('../middleware/adminAuthMiddleware');
const Admin = require('../models/Admin');
const { logoutAdmin, showOrder, showCustomer, getDashboard, getLineChart, getPieChart, getBarChart, getDashboardStats, productSearch, getCoupon, getBanner } = require('../controller/adminAuthController');
const Product = require('../models/Product');
const Enquiry = require('../models/Enquiry');
const Banner = require('../models/Banner');
//=================================================

//------------------USER SIDE----------------------

// ======================================================
//index page
router.get('/', verifyTokenIndex, async (req, res) => { 
    req.session.email = null;
    const getProducts = await Product.find().limit(3);
    const banner = await Banner.findOne()
    res.render('user/index', {user: req.user, products: getProducts, banner});
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
router.get('/contact', verifyTokenIndex, (req, res) => {
    req.session.email = null;
    res.render('user/contact', { user: req.user });
});

///=======================================================

//---------------profile page----------------------

//profile info
router.get('/profile',verifyToken, (req, res) => {
  req.session.email =  req.user.email
  res.render('user/profile', {user: req.user, error: null,
        showEditProfileModal : false, success: false})
})

//profile order
router.get('/profileOrder', verifyToken, getProfileOrder)

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

//---------------single product page----------------------
router.get('/singleproduct/:id', verifyTokenIndex, getSingleProduct)


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

//---------------order COD ----------------------
router.get('/order/success/cod/:orderId', verifyToken, orderCOD)
///=======================================================

//---------------404 error ----------------------
router.get('/error404', verifyToken, (req, res) => {
  res.render('user/404', {user: req.user})
})



///=======================================================

//  ----------[passsport]-------------
// it is for passport js registration
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
//-------------------------------
//admin dash or index page
//----------------------------------
router.get('/admin', adminVerifyToken, async(req, res) => {
  return res.render('admin/index', {admin: req.admin})
})
router.get('/admin/stats', adminVerifyToken, getDashboardStats)//stat using ajax
router.get('/admin/revenue-data', adminVerifyToken, getLineChart)//line chart
router.get('/admin/pie-data', adminVerifyToken, getPieChart)//pie chart
router.get('/admin/bar-data', adminVerifyToken, getBarChart)//bar chart

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
  res.render('admin/products',  {admin:req.admin,showAddProductModal :false, products: getProducts, showEditProductModal : false, errors: [], prod: false})
})
//edit button
router.get('/admin/products/edit/:id',adminVerifyToken, async(req, res) => {
  const product = await Product.findById(req.params.id)
   const getProducts = await Product.find();
  if(!product) return res.redirect('/admin/products');
  res.render('admin/products',  {admin: req.admin, showAddProductModal :false, products: getProducts, showEditProductModal : true, errors: [], prod: product})
})


//--------------------------------------
//----------admin orders page -------------
//---------------------------------------
router.get('/admin/orders',adminVerifyToken, showOrder)

//--------------------------------------
//----------admin customers page -------------
//---------------------------------------
router.get('/admin/customers', adminVerifyToken, showCustomer)

//--------------------------------------
//----------admin gallery page -------------
//---------------------------------------
router.get('/admin/editProduct', adminVerifyToken, (req, res) => {
  res.render("admin/editProduct")
})

router.get('/admin/editProduct/product-search', adminVerifyToken, productSearch)//search product

//--------------------------------------
//----------admin coupons page -------------
//---------------------------------------
router.get('/admin/coupons',adminVerifyToken, getCoupon)

//--------------------------------------
//----------admin support page -------------
//---------------------------------------
router.get('/admin/support',adminVerifyToken, async(req, res) => {
  const enquiries = await Enquiry.find();
  res.render('admin/support', {enquiries})
})

//--------------------------------------
//----------admin logs page -------------
//---------------------------------------
router.get('/admin/logs',adminVerifyToken, async(req, res) => {
  res.render('admin/logs')
})

//--------------------------------------
//----------admin banner page -------------
//---------------------------------------
router.get('/admin/banner',adminVerifyToken, getBanner);//show banner page
router.get("/banner/edit/:id", adminVerifyToken, );//edit banner page




module.exports = router;