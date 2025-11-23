const jwt = require('jsonwebtoken');
const User = require('../models/User');

async function verifyToken(req, res, next) {
    console.log('token verification started...');
    //taking token id  from cookies
    const token = await req.cookies?.token;
    console.log(token)
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
                 console.log('abi its tokennot ')

       
        return res.redirect(`/login`)
       
    }
    
    
}
async function verifyTokenIndex(req, res, next) {
    console.log('token verification started...');
    //taking token id  from cookies
    const token =  req.cookies?.token;
    if(token) {
        try {
            //here token verifies and it stored in to vrifies 
            const verifies = jwt.verify(token, process.env.JWT_SECRET_KEY);
            console.log('token verified...')
            req.user = await User.findById(verifies.tokenId).select("-password");
             if(req.user.isBlocked) {
                 await res.clearCookie("token");
                 return res.redirect('/login')
            }
            
        } catch( err ) {
            console.log('an error occured in token validation: ', err);
        }
    }
    next();
    
}

module.exports = {
    verifyToken,
    verifyTokenIndex
};