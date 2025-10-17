const Admin = require("../models/Admin");
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken');

const loginAdmin = async(req, res) => {
    try {
        const {email, password} = req.body;
        const isAdmin = await Admin.exists({email})
        console.log(isAdmin)
        //checking email and password exists
        if(!isAdmin) return res.render('admin/adminLogin', {errors: [{msg:'user not found', path: 'error'}]});
        const  isPassword  = await Admin.exists({password})
        if(!isPassword) return res.render('admin/adminLogin', {errors: [{msg:'password mismatch!', path:'error'}]})

        const token = jwt.sign({email}, process.env.JWT_SECRET_KEY, {expiresIn: '1d'});
        
        res.cookie('token', token, { httpOnly: true, maxAge: 24 * 60 * 60 * 1000, sameSite:  'strict' });
    
        res.redirect('/admin')

    }catch(err) {
        console.log('error occured in admin login', err)
    }
}

const settings = async(req, res) => {
    try{
        const {name, email, password} = req.body;
        const admin = await Admin.findOne({email: req.session.email});
        
        if((admin.password == password) && (admin.email == email) && (admin.name == name)) return res.render('admin/settings', {errors: [{msg: 'Already exist!', path: 'exist'}], admin:admin})  

        // Update values
        admin.name = name;
        admin.email = email;
        admin.password = password;
        await admin.save();

        const updatedAdmin = await Admin.findOne({ email: admin.email });

        return res.render('admin/settings', {
        admin: updatedAdmin,
        errors: [{msg: 'update successfully', path: 'success'}]
    });
    }catch(err) {
        console.log('error occured in settings page ', err)
    }
}

module.exports = {
    loginAdmin,
    settings
}