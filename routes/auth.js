const express = require('express');
const { registerUser, loginUser, forgotPassword, otpVerify, resetPassword, deleteAccount, forgotProfile, changePassword, updateProfile, addToCart, updateCart, removeCart, wishlistAdd, remeoveWishlist, addTowishlist, addAddress, editAddress, deleteAddress, setDefaultAddress, postCheckout, cancelOrder, couponAdd, removeCoupon, contactUs, ratings } = require('../controller/userAuthController');
const { signupValidation, loginValidation, forgotValidation, resetPasswordValidation, updateProfileValidation, addressValidation, addressEditValidation } = require('../middleware/userValidator');
const { verifyToken } = require('../middleware/authMiddleware');
const createMulter = require('../middleware/profilePhotoUpload');
const { loginAdmin, settings, addProduct, editProduct, deleteProduct, updateOrderStatus, blockUser, addProductGallery, deleteGalleryImage, addCoupon, editCoupon, blockCoupon, deleteCoupon, resolveSupport, sendReply } = require('../controller/adminAuthController');
const { adminLoginValidation, adminSettingValidation, adminProductValidation } = require('../middleware/adminValidator');
const { adminVerifyToken } = require('../middleware/adminAuthMiddleware');
const router = express.Router();


router.post('/signup', signupValidation, registerUser);
router.post('/login', loginValidation, loginUser)
router.post('/forgotPassword', forgotValidation, forgotPassword)
router.post('/verifyOtp', otpVerify)
router.post('/resetPassword', resetPasswordValidation, resetPassword)
// ----------------------------------------------
//  --------CONTACT US SECTIONS------------------
// ------------------------------------------------

router.post('/contact', contactUs)

// ----------------------------------------------
//  --------PROFILE SECTIONS------------------
// ------------------------------------------------

router.post('/delete', verifyToken, deleteAccount)//delete account
router.post('/forgotProfile',verifyToken, forgotProfile)//forgot password
router.post('/profileChangePassword',verifyToken, changePassword)//update password
const profileUpload = createMulter('profile')
router.post('/updateProfile', verifyToken, profileUpload.single('profilePhoto'), updateProfile)//update profile details
router.post('/addAddress', verifyToken, addressValidation, addAddress)//address add 
router.post('/editAddress', verifyToken,addressEditValidation, editAddress)//edit address
router.post('/deleteAddress/:id', verifyToken, deleteAddress)//delete address
router.post('/setDefaultAddress/:id', verifyToken, setDefaultAddress)//default address
router.put('/cancel-order/:id', verifyToken, cancelOrder)

// ----------------------------------------------
//  --------SHOP SECTIONS------------------
// ------------------------------------------------
router.post("/product/:id/rate", verifyToken, ratings);



// ----------------------------------------------
//  --------CART SECTIONS------------------
// ------------------------------------------------
router.post('/shop/add-to-cart', verifyToken, addToCart)//adding to cart
router.post('/cart/update', verifyToken, updateCart)//update cart
router.post('/cart/remove', verifyToken, removeCart)//removing cart
router.post('/cart/coupon-add', verifyToken, couponAdd)//applying coupon
router.post('/cart/coupon-remove', verifyToken, removeCoupon)//removing applied coupon


// ----------------------------------------------
//  -------- WISHLIST SECTIONS------------------
// ------------------------------------------------
router.post('/wishlist/add', verifyToken, wishlistAdd)//add wishlist to items
router.post('/wishlist/remove', verifyToken, remeoveWishlist)
router.post('/wishlist/add-to-cart', verifyToken, addTowishlist)


// ----------------------------------------------
//  -------- CHECKOUT SECTIONS------------------
// ------------------------------------------------
router.post('/checkout', verifyToken, postCheckout)




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

// ----------------------------------------------
//  --------ORDER SECTIONS------------------
// ------------------------------------------------

router.post('/admin/orders/:id/status', adminVerifyToken, updateOrderStatus)
router.put('/admin/users/:id/block', adminVerifyToken, blockUser)

//--------------------------------------
//---------- GALLERY SECTIONS -------------
//---------------------------------------
const productGallery = createMulter('gallery');
router.post('/admin/editProduct/add-gallery/:id', adminVerifyToken, productGallery.array("images", 6), addProductGallery)

router.delete('/admin/editProduct/delete-image/:id', adminVerifyToken, deleteGalleryImage);//delete the gallery

//--------------------------------------
//---------- COUPONS SECTION -------------
//---------------------------------------

router.post('/admin/coupons', adminVerifyToken, addCoupon)//add coupon
router.post('/admin/coupons/edit', adminVerifyToken, editCoupon)//edit coupon
router.post('/admin/coupons/block/:id', adminVerifyToken, blockCoupon)//block coupon
router.delete('/admin/coupons/delete/:id', adminVerifyToken, deleteCoupon)//delete coupon

//--------------------------------------
//---------- SUPPORT SECTION -------------
//---------------------------------------

router.post('/admin/support/resolve', adminVerifyToken, resolveSupport)
router.post('/admin/support/reply', adminVerifyToken, sendReply)


module.exports = router 