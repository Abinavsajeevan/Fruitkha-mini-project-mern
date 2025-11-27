require("dotenv").config();
const Stripe = require("stripe");
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
const User = require('../models/User');
const {validationResult} = require('express-validator');
const bcrypt = require('bcrypt');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const { sendOtpEmail } = require('../utils/sendOtp');
const Product = require('../models/Product');
const Cart = require('../models/Cart');
const paginationShop = require('../utils/paginateShop');
const shopFilter = require('../utils/shopFilterQuery');
const Wishlist = require('../models/Wishlist');
const Address = require('../models/Address');
const defaultAddress = require('../utils/defaultAddress');
const Order = require('../models/Order');
const sendOrderPDFEmail = require('../utils/sendOrderPDFEmail');



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
        
        //if user blocked 
        if(user.isBlocked) return res.render('user/login', {errors: [{msg:'You are blocked, please contact the owner', path: 'no_user'}], user: null});
        
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
        res.cookie("token", token, { httpOnly: true, maxAge: 24 * 60 * 60 * 1000 , sameSite: 'lax'});
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
//profile get address 
const addressProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    const isDefAddress = await Address.findOne({userId, isDefault: true});
    const address = await Address.find(
      {
        userId,
        _id:{ $ne: isDefAddress._id}
      }
    );

    return res.render('user/profileAddress', {user: req.user, errors:[], showAddAddressModal:false, address, showEditAddressModal : false, data:null, def: isDefAddress})
  }catch(err) {
    console.log('error occured in address page', err)
  }
}

//profile add address
const addAddress = async (req, res) => {
  try {
    const userId = req.user._id;
    const {label, street, city, district, country, pincode, phone} = req.body;
    
    const existingAddress = await Address.findOne({
     userId,
     street: street.trim(),
     city: city.trim(),
     district: district.trim(),
     country: country.trim(),
     pincode: pincode.trim(),
     phone: phone.trim(),
   });

      const isDefAddress = await Address.findOne({userId, isDefault: true});
    const address = await Address.find(
      {
        userId,
        _id:{ $ne: isDefAddress._id}
      }
    );

  
   if(existingAddress) return res.render('user/profileAddress', {user: req.user, errors:[{msg: 'Address Already Exists!', path: 'label'}], showAddAddressModal: true, address, showEditAddressModal: false, data:'',def: isDefAddress});


     const addresses = new Address({
        userId,
        label,
        street,
        city,
        district,
        country,
        pincode,
        phone
       })
       await addresses.save();

       defaultAddress()
    return res.render('user/profileAddress', {user: req.user, errors: [{msg:  'Address Added Successfully✅', path: 'success'}],showAddAddressModal: true, address, showEditAddressModal: false, data:'', def: isDefAddress})

  } catch(err) {
    console.log('error occured in addaddress', err)
  }
}

//profile edit address
const editAddress = async (req, res) => { 
  try {
    const userId = req.user._id
    const {id, label, street, city, district, country, pincode, phone} = req.body;
    console.log(id, label, street, city, district, country, pincode, phone)
    const existingAddress = await Address.findOne({userId, label, street, city, district, country, pincode, phone});
    console.log(id)

//for passing data 
 let isDefAddress = await Address.findOne({userId, isDefault: true});
    const address = await Address.find(
      {
        userId,
        _id:{ $ne: isDefAddress._id}
      }
    );
    //existing error message
    if(existingAddress) return res.render('user/profileAddress', {user: req.user, errors:[{msg: 'No Updation Found!', path: 'label'}], showAddAddressModal: false, address, showEditAddressModal: true, data:existingAddress, def:isDefAddress});

//updating database documents
   await Address.findOneAndUpdate(
      {_id:id, userId},
      {
        label,
        street,
        city,
        district,
        country,
        pincode,
        phone
      }  ,{ new: true }
    )

    //updated data
     isDefAddress = await Address.findOne({userId, isDefault: true});
    const updatedAddress = await Address.find(
      {
        userId,
        _id:{ $ne: isDefAddress._id}
      }
    );
    const newData = await Address.findOne({userId, _id: id})
    
    return res.render('user/profileAddress', {user: req.user, errors:[{msg: 'Updated Successfully', path: 'success'}], showAddAddressModal: false, address: updatedAddress, showEditAddressModal: true, data:newData, def: isDefAddress});


  } catch(err) {
    console.log('error occured in editing address', err);
  }
}

//profile delete address
const deleteAddress = async (req, res) => {
  try {
    const id = req.params.id;
    await Address.findByIdAndDelete(id)
    defaultAddress()
    res.redirect('/profileAddress')
  } catch(err) {
    console.log('error occured in delete account', err)
  }
}

//profile default address 
const setDefaultAddress = async (req, res) => {
  try {
    const userId = req.user._id;
    const _id = req.params.id;

    //change exist default to normal
    const existDefault = await Address.findOne({isDefault: true})
    existDefault.isDefault = false;
    await existDefault.save()

    //new default set
    const address = await Address.findById(_id);
    address.isDefault = true;
    await address.save()
    res.redirect('/profileAddress')


  }catch (err)  {
    console.log('error occured in default address set', err)
  }
}

//profile add orders method = GET
const getProfileOrder = async (req, res) => {
  try {
    const orders = await Order.find({userId: req.user._id}).sort({ createdAt: -1 })
    res.render('user/profileOrder', {user: req.user, orders})
  } catch(err) {
    console.log('error occured in order profile', err);
  }
}

//profile cancel order METHOD = PUT
const cancelOrder = async (req, res) => {
  try {
    const orderId = req.params.id;
    const {status, reason} = req.body;

    const updatedOrder = await Order.findByIdAndUpdate(orderId, 
      {orderStatus: status,
        deliveredAt: reason
      },
      {new: true}
    );
    if(!updatedOrder) return res.status(404).json({message: 'Order not found'});

    res.json({message: 'order cancelled successfully', order: updatedOrder})

  }catch(err) {
    console.log('error occured in cancelorder', err)
  }
}

//show single  product METHOD = GET
const getSingleProduct = async (req, res) => {
  try {
    const userId = req.user._id;
    const _id = req.params.id;

    const product = await Product.findById(_id);
    if(!product) return res.redirect('/shop');
    
    res.render("user/single-product", {user: req.user, product})
  }catch(err) {
    console.log('error occured in single product', err);
  }
}

//shop page METHOD = GET
const getShop = async (req, res) => {
  try {
       const { page, filter, sortOption, category, availability, sort, min_max, offer } = await shopFilter(req.query)

      const  { getProducts, totalPages } = await paginationShop(page, filter, sortOption);
     

    return res.render('user/shop', {user: req.user, products: getProducts, currentPage: page, totalPages, category, availability, sort, min_max, offer, msg:null, path:null});
  }catch (err) {
    console.log('Error occured in shop ', err)
  }
 }

//add to cart METHOD = POST
const addToCart = async (req, res) => {
  try {
    console.log('hwoo')
    const userId = req.user._id;
    const { productId } = req.body;

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ success: false, message:'Product not found' });

    let cart = await Cart.findOne({ user: userId });
    if (!cart) {
      cart = new Cart({
        user: userId,
        products: [],
        subTotal: 0,
        shipping: 0,
        total: 0
      });
      await cart.save();
    }

    const existingProduct = cart.products.find(item => item.product.equals(productId));
    if (existingProduct) {
      return res.json({success: false, message: 'Product already added to cart ⚠️'})
    } else {
      cart.products.push({
        product: productId,
        price: product.price,
        totalPrice: product.price,
      });
    }

    // ---------- Update Totals ----------
    cart.subTotal = cart.products.reduce((sum, item) => sum + item.totalPrice, 0);
    cart.shipping = 45;
    cart.total = cart.subTotal + cart.shipping;
    await cart.save();

    // ---------- Render Shop Page ----------
    return res.json({ success: true, message: "Product added to cart ✅" });

  } catch (err) {
    console.log('Error occurred in adding to cart:', err);
        res.status(500).json({ success: false, message: "Internal server error" });
  }
}


//cart page show
const getCart = async (req, res) => {
    try {
        const userId = req.user._id;
        const msg = req.query.msg || '';
        const prodId = req.query.id || '';
        const cart = await Cart.findOne({user: userId}).populate('products.product');
        return res.render('user/cart', { cart, user: req.user,msg,prodId });
        
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
        if(quantity > productItem.product.stock) return res.redirect('/cart?msg=' + encodeURIComponent('Product limit exceeded')+'&id='+productItem.product._id)
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

//wishlist add METHOD = POST
const wishlistAdd = async (req, res) => {
    try {
        const userId = req.user._id;
        const { productId } = req.body;
        //its already do 

        const product = await Product.findById(productId);
         if (!product) return res.json({ success: false, message: "Product not found" });

        //wishlist check and no created
        let wishlist = await Wishlist.findOne({user: userId});
        if(!wishlist) wishlist = new Wishlist({
            user: userId,
            products: []
        })
        const existProduct = wishlist.products.some(product => product.toString() === productId.toString()) //it checks only true or false not entire elements
         if (existProduct) return res.json({ success: false, message: "Already in wishlist 🧡" });

            wishlist.products.push(productId);
            await wishlist.save();


          return res.json({ success: true, message: "Added to wishlist 🧡" });

    }catch(err) {
        console.log('error occured in wishlist adding ', err);
         return res.json({ success: false, message: "Error adding to wishlist" });
    }
}

//wishlist view METHOE = GET
const getWishlist = async (req, res) => {
    try {
        const userId = req.user._id;//taking user id

        const wishlist = await Wishlist.findOne({user: userId}).populate('products');
        
        if(!wishlist) return res.render('user/wishlist', {user: req.user, wishlist:null, products: null, currentPage: null, totalPages: null, msg: null,path:null})

            //for pagination  
        const page = parseInt(req.query.page) || 1
        const limit = 6;
        const skip = ( page - 1) * limit;
        const totalProduct = wishlist.products.length
        const productPage = wishlist.products.slice(skip, skip + limit)
        const totalPages = Math.ceil(totalProduct/limit)        
        if(wishlist.products.length > 0) {
            
         return res.render('user/wishlist', {user: req.user, wishlist, products: productPage, currentPage: page, totalPages, msg: null,path:null});
        }
        else {
            return res.render('user/wishlist', {user: req.user, wishlist, products: [], currentPage: page, totalPages, msg: null, path:null});//no product case
        }
        

    }catch (err) {
        console.log('error occured in getwishlist', err)
    }
}

//wishlist remove 
const remeoveWishlist = async (req, res) => {
    try {
        const userId = req.user._id;
        const { productId } = req.body;

        let wishlist = await Wishlist.findOne({user: userId}).populate('products');
        if(!wishlist) return res.render('user/wishlist', {user: req.user, wishlist:null, products: [], currentPage: null, totalPages: null, msg: null, path: null})

        if(wishlist.products.length === 0) return res.render('user/wishlist', {user: req.user, wishlist, products: [], currentPage: null, totalPages:null,msg:null, path: null});//no product case 

        wishlist.products = wishlist.products.filter(item => item._id.toString() !==  productId.toString())
        await wishlist.save();
        wishlist = await Wishlist.findOne({user: userId}).populate('products');
                       //for pagination  
        const page = parseInt(req.query.page) || 1
        const totalProduct = wishlist.products.length
        const limit = 6;
         if(page > 1 && totalProduct > 0 && totalProduct == 6 * (page-1)) page--;//if above page product no product it will decreased       

        const skip = ( page - 1) * limit;
        const productPage = wishlist.products.slice(skip, skip + limit)
        const totalPages = Math.ceil(totalProduct/limit);
        
        return res.render('user/wishlist', {user: req.user, wishlist, products: productPage, currentPage: page, totalPages, msg:'product removed successfully❌', path:null});


    }catch(err) {
        console.log('error occured in removing wishlist', err)
    }
}

//add to cart METHOD = POST
const addTowishlist = async (req, res) => {
  try {
    const userId = req.user._id;
    const { productId } = req.body;

    const product = await Product.findById(productId);
    if (!product) return res.json({ success: false, message: "Product not found" });


    let cart = await Cart.findOne({ user: userId });
    if (!cart) {
      cart = new Cart({
        user: userId,
        products: [],
        subTotal: 0,
        shipping: 0,
        total: 0
      });
      await cart.save();
    }

    const existingProduct = cart.products.find(item => item.product.equals(productId));
    if (existingProduct) {
      return res.json({
        success: false,
        message: "Already in cart⚠️"
      });
    } else {
      cart.products.push({
        product: productId,
        price: product.price,
        totalPrice: product.price,
      });
    }

    // ---------- Update Totals ----------
    cart.subTotal = cart.products.reduce((sum, item) => sum + item.totalPrice, 0);
    cart.shipping = 45;
    cart.total = cart.subTotal + cart.shipping;
    await cart.save();

    // wishlist.products = wishlist.products.filter(item => item._id.toString() !== productId.toString())
    // await wishlist.save()
    // -----/if i want to delete a product from wishlist when added to cart ( but there is so many criteria are there)

    // ---------- Render Shop Page ----------
    return res.json({
      success: true,
      message: "Added to cart✅"
    });
  } catch (err) {
    console.log('Error occurred in adding to cart:', err);
    res.json({ success: false, message: "Server error" });
  }
}

//checkout get page
const getCheckout = async (req, res) => {
  try {
    const userId = req.user._id;
//-----------ORDER SUMMARY ----------------
    //checking cart if not dont come back to this page
    const cart = await Cart.findOne({user: userId}).populate('products.product');
    if(!cart || !cart.products.length > 0) return res.redirect('/shop');

    //-------CHECKOUT PAGE ------------------
    //-------Addresses ------------------
    const address = await Address.find({
      userId, 
      isDefault: {$ne: true}
    });
    const isDef = await Address.findOne({userId, isDefault: true})//address contains default address

    //-------contact form ------------------
    const user = await User.findById(userId)

    return res.render('user/checkout', {user: req.user, products: cart.products, cart, address, isDef, user})

  }catch (err) {
    console.log('error occured in getcheckout page', err)
  }
}

//checkout post page 
const postCheckout = async (req, res) => {
  try {
    const userId = req.user._id;
    const { selectedAddressId, paymentMethod, fullName, email, phone, alternatePhone, instructions } = req.body;
    const orderDate = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    console.log(orderDate)

    const address = await Address.findById(selectedAddressId)
    const cart = await Cart.findOne({user:userId}).populate('products.product')
   //order creation
   const order = await Order.create({
    userId,
    address: {
      fullName,
      email,
      phone,
      alternatePhone: alternatePhone || '',
      street: address.street,
      city: address.city,
      district: address.district,
      pincode: address.pincode,
      country: address.country,
      label: address.label
    },
    items: cart.products.map(item => ({
      productId: item.product._id,
      name: item.product.name,
      quantity: item.quantity,
      price: item.price,
      total: item.quantity * item.price
      })),
      totalAmount: cart.total,
      paymentMethod,
      paymentStatus: 'pending',
      orderStatus: 'pending',
      deliveryInstruction: instructions || '',
      orderDate,
      deliveredAt:'',
      cancelDate: ''

    });

    if (paymentMethod == 'cod') {
      for(const item of cart.products) {
        await Product.findByIdAndUpdate(
          item.product._id,
          {$inc: {stock: -item.quantity}}
        );
      }

      return res.redirect(`/order/success/${order._id}`);
    } else {
      return res.redirect(`/payment/${order._id}`);
    }

  }catch(err) {
    console.log('error occured in post checkout', err);
  }
}

//order COD 
const orderCOD = async (req, res) => {
  try {
    const userId = req.user._id;
    const {orderId} = req.params
    const order = await Order.findOne({userId, _id:orderId})

    //cart data will be empty
    await Cart.findOneAndUpdate({user:userId }, { $set: { products: [] } })
    if(order.address.email) {
      await sendOrderPDFEmail(order, order.address.email)
    }

    return res.render('user/orderConfirmation',{order})

  } catch(err) {
    console.log('error occured in order cod', err)
  }
}

//stripe
//-------------
//get stripe
const getStripe = async (req, res) => {
  try {
    console.log('stripe worked get ....')
    const { orderId } = req.params;
    const order = await Order.findById(orderId);
    if(!order) return res.redirect('/checkout');
    if(order.paymentMethod !== 'card') return res.redirect('/checkout');

    const line_items = order.items.map(item => ({
          price_data: {
            currency: 'inr',                                 // use currency your store uses
            product_data: { name: item.name },
            unit_amount: Math.round(item.price * 100)       // convert rupees to paise
          },
          quantity: item.quantity
        }));

            const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items,
      metadata: { orderId: order._id.toString(), userId: order.userId.toString() },
      success_url: process.env.STRIPE_SUCCESS_URL ||  `${req.protocol}://${req.get("host")}/order/success/{CHECKOUT_SESSION_ID}`,
      cancel_url: process.env.STRIPE_CANCEL_URL || `${req.protocol}://${req.get('host')}/checkout`,
    });

        order.stripeSessionId = session.id;
    if (session.payment_intent) order.stripePaymentIntentId = session.payment_intent;
    await order.save();
    console.log('stripe worked successfully get ....')


        return res.redirect(303, session.url);
  }catch(err) {
    console.log('error occured in getstripe controller', err);
  }
}

//post stripe

const postStripe =async (req, res) => {
    console.log('stripe worked post ....')
  const sig = req.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);//verify stripe event
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const orderId = session.metadata && session.metadata.orderId;
        // Mark order paid, decrement stock, clear cart
        if (orderId) {
          const order = await Order.findById(orderId);
          if (order && order.paymentStatus !== 'paid') {
            order.paymentStatus = 'paid';
            order.stripePaymentIntentId = session.payment_intent || order.stripePaymentIntentId;
            order.orderStatus = 'pending'; 
            await order.save();

            // decrement product stock
            for (const item of order.items) {
              await Product.findByIdAndUpdate(item.productId, { $inc: { stock: -item.quantity } });
            }

            // clear user's cart
            await Cart.findOneAndDelete({ user: order.userId });
          }
        }
        break;
      }

      case 'checkout.session.async_payment_failed':
      case 'payment_intent.payment_failed': {
        // Handle failure if you need: mark order paymentStatus = 'failed'
        const session = event.data.object;
        const orderId = session.metadata && session.metadata.orderId;
        if (orderId) {
          await Order.findByIdAndUpdate(orderId, { paymentStatus: 'failed' });
        }
        break;
      }

      // add other events if you need
      default:
        // console.log(`Unhandled event type ${event.type}`);
    }
  } catch (err) {
    console.error('Error handling webhook event:', err);
    
    return res.status(500).send();
  }
    console.log('stripe worked post completed ....')

  res.json({ received: true });
};

//success stripe
const stripeSuccess = async (req, res) => {
    try {
    console.log('stripe worked success ....')

        const sessionId = req.params.sessionId;

        // 1. Retrieve the Checkout Session
        const session = await stripe.checkout.sessions.retrieve(sessionId);

        // 2. Retrieve the PaymentIntent
        const paymentIntent = await stripe.paymentIntents.retrieve(session.payment_intent);

        const order = await Order.findOne({_id: session.metadata.orderId})
        // 3. Show "payment successful" page
    console.log('stripe worked success completed ....')
     if(order.address.email) {
      await sendOrderPDFEmail(order, order.address.email)
    }

        res.render('user/orderConfirmation', {order});

    } catch (err) {
        console.error("Success route error:", err);
        res.status(500).send("Payment success processing failed.");
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
    addressProfile,
    addAddress,
    editAddress,
    deleteAddress,
    setDefaultAddress,
    getProfileOrder,
    cancelOrder,
    getSingleProduct,
    getShop,
    addToCart,
    getCart,
    updateCart,
    removeCart,
    wishlistAdd,
    getWishlist,
    remeoveWishlist,
    addTowishlist,
    getCheckout,
    postCheckout,
    orderCOD,
    getStripe,
    postStripe,
    stripeSuccess
}