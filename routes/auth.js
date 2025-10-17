const express = require('express');
const { registerUser, loginUser, forgotPassword, otpVerify, resetPassword, deleteAccount, forgotProfile, changePassword, updateProfile } = require('../controller/userAuthController');
const { signupValidation, loginValidation, forgotValidation, resetPasswordValidation, updateProfileValidation } = require('../middleware/userValidator');
const { verifyToken } = require('../middleware/authMiddleware');
const upload = require('../middleware/profilePhotoUpload');
const { loginAdmin, settings } = require('../controller/adminAuthController');
const { adminLoginValidation, adminSettingValidation } = require('../middleware/adminValidator');
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
router.post('/updateProfile', verifyToken, upload.single('profilePhoto'), updateProfile)//update profile details



//=====================================================================================

//====================== ADMIN PAGES ========================   

//========================================================================
router.post('/admin/login',adminLoginValidation, loginAdmin)

//admin settings
router.post('/admin/settings', adminSettingValidation, settings)

module.exports = router 