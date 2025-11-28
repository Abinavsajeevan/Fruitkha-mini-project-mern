const jwt = require('jsonwebtoken');
const User = require('../models/User');

async function verifyToken(req, res, next) {
    console.log('token verification started...');
    //taking token id  from cookies
    const token = await req.cookies?.token;
    if(token) {
        try {
            //here token verifies and it stored in to vrifies 
            const verifies =await jwt.verify(token, process.env.JWT_SECRET_KEY);
            console.log('token verified...')
            req.user = await User.findById(verifies.tokenId).select("-password");
            if(req.user.isBlocked) {
                 await res.clearCookie("token");
                 console.log('abi its token ')
                 res.redirect('/login')
            }
            next();
        } catch( err ) {
            console.log('an error occured in token validation: ', err);
        }
    }else {
                
        return res.redirect(`/login`)
       
    }
    
    
}
async function verifyTokenIndex(req, res, next) {
    console.log('token verification started...');

    const token = req.cookies?.token;

    if (!token) {
        // No user -> continue without user
        console.log('no token')
        req.user = null;
        return next();
    }

    try {
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
        console.log('token verified...');

        // Fetch user
        req.user = await User.findById(decoded.tokenId).select("-password");

        if (!req.user) {
            // User not found -> clear token
            res.clearCookie("token");
            return next();
        }

        if (req.user.isBlocked) {
            res.clearCookie("token");
            return res.redirect('/login');
        }

        return next();

    } catch (err) {
        console.log("Token validation error:", err);

        // Token invalid → clear cookie
        res.clearCookie("token");

        // Continue but without user
        req.user = null;
        return next();
    }
}


module.exports = {
    verifyToken,
    verifyTokenIndex
};