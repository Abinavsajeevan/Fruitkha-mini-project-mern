const User = require('../models/User');
const {validationResult} = require('express-validator')
let a =1

const registerUser = async (req, res) => {
    console.log('hai')
    const errors = validationResult(req);
    console.log('req.body:', req.body);
console.log('validationResult:', validationResult(req));
    if( !errors.isEmpty() ) {
        console.log('i aminside the validator')
        return res.render('signup', { errors: errors.array() })
    }
    console.log('hello')
    try {
 
        const { name,  email, mobile, password, confirm} =  req.body;
        console.log(a++)
        // check if emailExist
        const emailExist = true //await User.findOne({ email: email.toLowerCase() })
        if( emailExist ){console.log('data not passed');
             return res.render('signup', { errors: [{msg: 'already registered Email', param: 'email'}] });}
        
        // check if mobie exist
        const mobileExist = await User.findOne( { mobile });
        if( mobileExist ) return res.render('signup', {errors: [{msg: 'already registered mobile', param: 'mobile'}]});

    }catch(err) {
        console.log('error: ', err)
    }
}

module.exports = {
    registerUser
}