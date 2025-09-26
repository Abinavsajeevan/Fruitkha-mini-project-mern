const express = require('express');
const router = express.Router();
const passport = require('passport');

router.get('/', (req, res) => {
    res.render('user/index');
})

router.get('/login', (req, res) => {
    res.render('user/login');
})

router.get('/signup', (req, res) => {
  let errors = [];
  if(req.query.error === 'already') {
    errors.push({msg: 'This email is already registered. Please login.', path: null })
  }
    res.render('user/signup', {errors});
})

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