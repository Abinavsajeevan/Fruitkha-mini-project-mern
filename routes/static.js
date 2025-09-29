const express = require('express');
const router = express.Router();
const passport = require('passport');
const verifyToken = require('../middleware/authMiddleware');

router.get('/', verifyToken, (req, res) => {
    res.render('user/index', {user: req.user});
})

router.get('/login', (req, res) => {
    res.render('user/login', {errors : [], user: null});
})

router.get('/signup', (req, res) => {
  let errors = [];
  if(req.query.error === 'already') {
    errors.push({msg: 'This email is already registered. Please login.', path: null })
  }
    res.render('user/signup', {errors, user:null});
})

// it is for passport js
router.get('/auth/google', passport.authenticate('google-signup', { scope: ['profile', 'email'] }));

// callback route
router.get('/auth/google/callback',
  passport.authenticate('google-signup', { failureRedirect: '/signup?error=already' }),
  (req, res) => {
    // Successful login
    res.redirect('/dashboard'); 
  }
);


module.exports = router;