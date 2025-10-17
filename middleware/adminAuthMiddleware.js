const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');

const adminVerifyToken = async (req, res, next) => {
    const token = await req.cookies?.token;
    if(token) {
        try {
            const verify = await jwt.verify(token, process.env.JWT_SECRET_KEY);

            
            const admin = await Admin.findOne({email:verify.email})
            
            req.admin = admin.toObject();
            req.session.email = req.admin.email;

            next()

        } catch(err) {
            console.log('an error occured in token generation', err)
        }
    }else {
        return res.redirect('/admin/login')
    }
}

module.exports = {
    adminVerifyToken
}