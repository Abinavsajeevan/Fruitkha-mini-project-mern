const express = require('express');
const { registerUser, loginUser, forgotPassword, otpVerify, resetPassword, deleteAccount, forgotProfile, changePassword, updateProfile, addToCart, updateCart, removeCart, wishlistAdd, remeoveWishlist, addTowishlist } = require('../controller/userAuthController');
const { signupValidation, loginValidation, forgotValidation, resetPasswordValidation, updateProfileValidation } = require('../middleware/userValidator');
const { verifyToken } = require('../middleware/authMiddleware');
const createMulter = require('../middleware/profilePhotoUpload');
const { loginAdmin, settings, addProduct, editProduct, deleteProduct } = require('../controller/adminAuthController');
const { adminLoginValidation, adminSettingValidation, adminProductValidation } = require('../middleware/adminValidator');
const { adminVerifyToken } = require('../middleware/adminAuthMiddleware');
const router = express.Router();


router.post('/signup', signupValidation, registerUser);
router.post('/login', loginValidation, loginUser)
router.post('/forgotPassword', forgotValidation, forgotPassword)
router.post('/verifyOtp', otpVerify)
router.post('/resetPassword', resetPasswordValidation, resetPassword)

// ----------------------------------------------
//  --------PROFILE SECTIONS------------------
// ------------------------------------------------

router.post('/delete', verifyToken, deleteAccount)//delete account
router.post('/forgotProfile',verifyToken, forgotProfile)//forgot password
router.post('/profileChangePassword',verifyToken, changePassword)//update password
const profileUpload = createMulter('profile')
router.post('/updateProfile', verifyToken, profileUpload.single('profilePhoto'), updateProfile)//update profile details


// ----------------------------------------------
//  --------CART SECTIONS------------------
// ------------------------------------------------
router.post('/shop', verifyToken, addToCart)//adding to cart
router.post('/cart/update', verifyToken, updateCart)//update cart
router.post('/cart/remove', verifyToken, removeCart)//removing cart



// ----------------------------------------------
//  -------- WISHLIST SECTIONS------------------
// ------------------------------------------------
router.post('/wishlist/add', verifyToken, wishlistAdd)//add wishlist to items
router.post('/wishlist/remove', verifyToken, remeoveWishlist)
router.post('/wishlist', verifyToken, addTowishlist)

//=====================================================================================

//====================== ADMIN PAGES ========================   

//========================================================================
router.post('/admin/login',adminLoginValidation, loginAdmin)

//admin settings
router.post('/admin/settings', adminSettingValidation,adminVerifyToken, settings)

// ----------------------------------------------
//  --------PRODUCT SECTIONS------------------
// ------------------------------------------------
const productUpload = createMulter('product');
router.post('/admin/products/add', adminVerifyToken, productUpload.single('image'), adminProductValidation, addProduct)

//edit button
router.post('/admin/products/edit', adminVerifyToken, productUpload.single('image'), adminProductValidation, editProduct);
//delete button
router.post('/admin/products/delete/:id', adminVerifyToken, deleteProduct)

module.exports = router 