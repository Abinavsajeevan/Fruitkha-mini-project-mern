const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20');
const User = require('../models/User');

passport.serializeUser((user, done) => {
    console.log('into the serializeuser')
    done(null, user.id)
})
passport.deserializeUser(async (id, done) => {
    try {
    console.log('into the deserializeuser')

        const user = await User.findById(id);
        done(null, user);
    } catch(err) {
        done(err, null);
    }
});

passport.use('google-signup', new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL
},
async (accessToken, refreshToken, profile, done) => {
    try {
        console.log('passport or google auth working...')
        // extract email
        const email = profile.emails && profile.emails[0] && profile.emails[0].value;
        if(!email) return done(null, false, { message: 'Google account has no email' });

        // Check if email already exists 
        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if(existingUser) {
            // User already exists 
            return done(null, false);
        }
        console.log('new user created using passport js')
        // Create new user for Google registration
        const newUser = await User.create({
            name: profile.displayName || (profile.name && profile.name.givenName) || 'No Name',
            email: email.toLowerCase(),
            googleId: profile.id,
            provider: 'google',
            password: null,
            mobile: null
        });

        return done(null, newUser);

    } catch (err) {
        done(err, null);
    }
}));

passport.use('google-login', new GoogleStrategy({
    
}))
