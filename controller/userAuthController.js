const User = require('../models/User');
const {validationResult} = require('express-validator');
const bcrypt = require('bcrypt');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const { sendOtpEmail } = require('../utils/sendOtp');
const Product = require('../models/Product');
const Cart = require('../models/Cart');
const paginationShop = require('../utils/paginateShop');


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
        if(user.password === null) return res.render('user/login', {errors: [{msg:'reset password or login with google', path: 'google'}], user: null});

        // checking user is blocked by admin
        if(user.isBlocked === true) return res.render('user/login', {errors: [{msg: 'This user is blocked', path: 'block'}], user: null},);

        //checking  password matching 
        const result = await bcrypt.compare(req.body.password, user.password);

        if(!result) return res.render('user/login', {errors: [{msg: 'Password mismatch❌', path: 'password'}], user: null});
        console.log('user verified now creating jwt token...')
        // create jwt token for authentication
        const token = jwt.sign({tokenId: user._id}, process.env.JWT_SECRET_KEY, {expiresIn: '2d'} )
        // storing token in cookie
        console.log('storing token in to cookie...')
        res.cookie("token", token, { httpOnly: true, maxAge: 24 * 60 * 60 * 1000 , sameSite: 'strict'});
        console.log('login completed....')
        
        res.redirect('/');
    }catch(err) {
        console.log('login error: ', err);
    }
}

// login using google
const googleLogin = async (req, res) => {
    console.log('creating token for google')
    // create jwt 
    const token = jwt.sign({tokenId: req.user._id}, process.env.JWT_SECRET_KEY, {expiresIn: '20d'});

    console.log('storing it in to cookie');
    res.cookie('token', token, { httpOnly: true, maxAge: 24 * 60 * 60 * 1000, sameSite: 'strict'});

    res.redirect('/');
}

//forgot passsword and otp generation
const forgotPassword = async (req, res) => {
    const errors = await validationResult(req);
    if(!errors.isEmpty()) {
        return res.render('user/forgotPassword', {errors: errors.array()});
    }
    try {
        const user =await User.findOne({email: req.body.email});
        // check if user exist
        if(!user) return res.render('user/forgotPassword', {errors: [{msg:'Please enter valid email', path: 'email'}]} );

        const otp = await  sendOtpEmail(req.body.email);
        await User.findOneAndUpdate(
        { email: req.body.email },
        {
            otp,
            otpExpiresAt: new Date(Date.now() + 5 * 60 * 1000) //expires in 5 min
        }
       );
       req.session.email = req.body.email;
    res.redirect('/verifyOtp')

    } catch (err) {
        console.log('error occured in forgot password: ', err);
    }
}

//otp verification
const otpVerify = async (req, res) => {
   const { otp1, otp2, otp3, otp4, otp5, otp6} = req.body;
   const otp = otp1 + otp2 + otp3 + otp4 + otp5 + otp6;
   console.log(req.session.email)
   const email =await req.session.email ;
   const user =await User.findOne({email})
   if(!user) return res.render('user/verifyOtp', {errors: [{msg: 'no user found', path: 'otp'}]})
    if(!user.otp || user.otpExpiresAt < Date.now()) {
        return res.render('user/verifyOtp', {errors: [{msg: 'Invalid OTP', path: 'otp'}]})
    }

    const result = await bcrypt.compare(otp, user.otp);
    if(!result) return res.render('user/verifyOtp', {errors: [{msg: 'otp mismatch', path: 'otp'}]})
    
    user.otp = null;
    user.otpExpiresAt = null;
    user.save();
    res.redirect('/resetPassword')
}

//in otp verification resend password
const resendOtp = async (req, res) => {
  try {
    const email = req.session.email; 
    if (!email) return res.redirect("/forgotPassword");

    const user = await User.findOne({ email });
    if (!user) {
      return res.render("user/verifyOtp", { errors: [{ msg: "User not found", path: "otp" }] });
    }

    
    const otp = await sendOtpEmail(email);

    user.otp = otp;
    user.otpExpiresAt = Date.now() + 5 * 60 * 1000; // 5 min expiry
    await user.save();

    res.render("user/verifyOtp", { errors: [{ msg: "OTP resent successfully", path: "resend" }] });
  } catch (err) {
    console.error(err);
    res.render("user/verifyOtp", { errors: [{ msg: "Error sending OTP", path: "otp" }] });
  }
}

//reset password
const resetPassword = async (req, res) => {
    const errors = await validationResult(req);
    if(!errors.isEmpty()) {
        return res.render('user/resetPassword', {errors: errors.array()});
    }
    try {
        const {password, confirmPassword} = req.body;
        if(password != confirmPassword) return res.render('user/resetPassword', {errors: [{msg: 'password mismatch!', path: 'confirmPassword'}]});

        const email = req.session.email;
        const  user = await User.findOne({email});
        if(!user) return res.render('user/forgotPassword', {errors: [{msg: 'error', path: 'email'}]})
            const isPassword =await bcrypt.compare(password, user.password)
        if(isPassword) return res.render('user/resetPassword', {errors: [{msg:'please enter a new password', path: 'confirmPassword'}]})
        const hashedPassword =await bcrypt.hash(password, 10);
       user.password = hashedPassword;
       user.provider = 'local'
       await user.save();
      
        if(req.cookies.token) {
            res.redirect('/profileSetting')
        }
       res.redirect('/login');
        
    }catch(err) {
        console.log('an error occured', err)
    }
}

//profile forgot password
const forgotProfile = async (req, res) => {
    try {
        const otp = await sendOtpEmail(req.session.email);
        await User.findOneAndUpdate(
            {email: req.session.email}, 
            {
                otp, 
                otpExpiresAt: new Date(Date.now() + 5 * 60 * 1000) //expires 5 min
            }
        );
        res.redirect('/verifyOtp')
    }catch(err) {
        console.log('error  in forgot profile password ', err)
    }
}

//logout
const logout = async (req, res) => {
    try{
    await res.clearCookie("token");
    res.redirect('/login');
    } catch(err) {
        console.log('error in logout',err)
    }
    
}

//delete account
const deleteAccount = async (req, res) => {
    try {
        const result = await User.deleteOne({_id: req.user._id});
        if(result.deletedCount > 0) {
            console.log('deleted');
            await res.clearCookie("token");
            res.redirect('/login')
        }else {
            res.redirect('/profileSetting')
        }
    }catch(err) {
        console.log('error in delete account', err)
    }
}

//profile changepassword
const changePassword = async(req, res) => {
    try {
        console.log('working')
        console.log(req.session.email)
        const {currentPassword, password, confirmPassword } = req.body;
        const user =await User.findOne({email: req.session.email});
        console.log(user)
          
   if(!currentPassword || !password || !confirmPassword) {
         return res.render('user/profileSetting', {
        user,
        error: 'all fields are mandatory',
        showChangePasswordModal: true,
        success: false
      });
    }
           if(password.length < 6) {
        return res.render('user/profileSetting', {
        user,
        error: 'password length must be 6 characters!',
        showChangePasswordModal: true,
        success: false
      });
    } 
    const samePassword = await bcrypt.compare(currentPassword, user.password);
    if (!samePassword) {
      return res.render('user/profileSetting', {
        user,
        error: 'current password not match!',
        showChangePasswordModal: true,
        success: false
      });
    }
 


    if(currentPassword == password) {
         return res.render('user/profileSetting', {
        user,
        error: 'New password cannot be same as current password',
        showChangePasswordModal: true,
        success: false
      });
    }

    if(password != confirmPassword) {
         return res.render('user/profileSetting', {
        user,
        error: 'password and confirm password must be match',
        showChangePasswordModal: true,
        success: false
      });
    }

    //hashing password
    const hashedPassword = await bcrypt.hash(password, 10)
    user.password = hashedPassword
    user.save()
    return res.render('user/profileSetting', {
        user,
        error: 'password update successfully',
        showChangePasswordModal: true,
        success: true
      });

    } catch(err) {
        console.log('error occured in changepassword', err)
    }
}

//update profile
const updateProfile = async (req, res) => {
    try {
        const {name, email, mobile} = req.body;
        if (!req.session.email) {
      // If session is lost, redirect to profile
      console.log('no email ');
      return res.redirect('/profile')
    }

        const user = await User.findOne({email: req.session.email})
        user.name = name;
        user.email = email;
        user.mobile = mobile;
        
       if(req.file) user.profilePhoto = `/uploads/profile/${req.file.filename}`;
       
        await user.save();
        const updateUser = await User.findOne({email: req.session.email})
   
        res.render('user/profile', {user:updateUser, error: 'updated',
        showEditProfileModal : true, success: true})
        

    } catch (err) {
        console.log('error occured in profil update', err);
          const user = await User.findOne({email: req.session.email})
        res.render('user/profile', {
            user: user, error: err.message,
        showEditProfileModal : true, success: false
        })
    }
}

//shop page METHOD = GET
const getShop = async (req, res) => {
  try {
      const page = parseInt(req.query.page) || 1;
      const category = req.query.category || '';
      const availability = req.query.availability || '';
      const sort = req.query.sort || '';
    //filteing the products it used as a query 
      const filter = {};
      if(category) filter.category = category;
      if(availability === 'In Stock') filter.stock = {$gt: 0};
      if(availability === 'Out of Stock') filter.stock = { $lte: 0};

      let sortOption = {};
      if(sort === 'low-high') sortOption.price = 1;
      else if(sort === 'high-low') sortOption.price = -1;
      else if(sort === 'newest') sortOption.createdAt = -1;
      else sortOption.updatedAt = 1;

      const  { getProducts, totalPages } = await paginationShop(page, filter, sortOption);
     

    return res.render('user/shop', {user: req.user, products: getProducts, currentPage: page, totalPages, category, availability, sort, msg:null, path:null});
  }catch (err) {
    console.log('Error occured in shop ', err)
  }
 }

//add to cart METHOD = POST
const addToCart = async (req, res) => {
    try {
        const userId = req.user._id;
        const { productId } = req.body;
        // console.log(userId, productId);
        const page = parseInt(req.query.page) || 1;
        const filter = {}
        const sortOption = { updatedAt : 1}
        const { getProducts, totalPages } = await paginationShop(parseInt(page, filter, sortOption));//taking pagination values from inbuilt function

        const product = await Product.findById(productId)
        if(!product) return res.redirect('/shop');
        
        let cart = await Cart.findOne({user: userId});
      
        if(!cart) {
            cart = new Cart({
                user: userId,
                products: [],
                subTotal:0,
                shipping: 0,
                total:0
            })
            await cart.save();
        } 
        const existingProduct = cart.products.find(item => item.product.equals(productId))//here equals use one is string  and  objectid so it easily compares
        if(existingProduct) {
            return res.render('user/shop', {user: req.user, products: getProducts, currentPage: page, totalPages, msg:'product already added to cart⚠️', path:'error'});
        }else {
            cart.products.push({
                product: productId,
                price: product.price,
                totalPrice: product.price,
            });
        }
        cart.subTotal = cart.products.reduce((sum, product) => sum + product.totalPrice, 0);
        cart.shipping = 45;
        cart.total = cart.subTotal + cart.shipping;
        await cart.save();
        return res.render('user/shop', {user: req.user, products: getProducts, currentPage: page, totalPages, msg:'product added to cart✅', path:'success'});        
    } catch(err) {
        console.log('error occured in adding to cart', err)
    }
}

//cart page show
const getCart = async (req, res) => {
    try {
        const userId = req.user._id;
        const cart = await Cart.findOne({user: userId}).populate('products.product');
        return res.render('user/cart', { cart, user: req.user });
        
    } catch (err) {
        console.log('error occured in getting cart', err)
    }
}

//update cart 
const updateCart = async (req, res) => {
    try {
        const userId = req.user._id;
        const { productId, quantity } = req.body;
        const cart = await Cart.findOne({ user: userId }).populate('products.product');
        const productItem = cart.products.find(item => item.product._id.equals(productId));//take the exact of product item
        productItem.quantity = parseInt(quantity);
        productItem.totalPrice = productItem.quantity * productItem.price;
        //calculating sub total
        cart.subTotal = cart.products.reduce((sum, product) => sum + product.totalPrice, 0);
        cart.total = cart.subTotal + cart.shipping;
        await cart.save();
        return res.redirect('/cart')

    }catch(err) {
        console.log('error occured in update cart ', err)
    }
}

//remove cart
const removeCart = async (req, res) => {
    try {
        const userId = req.user._id;
        const { productId } = req.body;

        await Cart.updateOne(
            {user: userId},
            {$pull: {products: {product: productId}}}
        )
        const cart = await Cart.findOne({ user: userId});
        cart.subTotal = cart.products.reduce((sum, item) => sum + item.totalPrice, 0);
        cart.total = cart.shipping + cart.subTotal;
        await cart.save();
        return res.redirect('/cart');


    } catch (err) {
        console.log('error occured in removing cart', err)
    }
}

module.exports = {
    registerUser,
    loginUser,
    googleLogin,
    forgotPassword,
    otpVerify,
    resendOtp,
    resetPassword,
    logout,
    deleteAccount,
    forgotProfile,
    changePassword,
    updateProfile,
    getShop,
    addToCart,
    getCart,
    updateCart,
    removeCart
}