const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20');
const User = require('../models/User');

passport.serializeUser((user, done) => {
    done(null, user.id)
})
passport.deserializeUser(async (id, done) => {
    try {
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
        // extract email
        const email = profile.emails && profile.emails[0] && profile.emails[0].value;
        if(!email) return done(null, false, { message: 'Google account has no email' });

        // Check if email already exists 
        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if(existingUser) {
            // User already exists → return error
            return done(null, false);
        }
        // Create new user for Google registration
        const newUser = await User.create({
            name: profile.displayName || (profile.name && profile.name.givenName) || 'No Name',
            email: email.toLowerCase(),
            googleId: profile.id,
            provider: 'google'
        });

        return done(null, newUser);

    } catch (err) {
        done(err, null);
    }
}));
