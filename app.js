require('dotenv').config()
const express = require('express');
const connectDb = require('./config/db');
const path = require('path');
const cookieParser = require('cookie-parser');

// all route files
const routes = require('./routes/index')
const session = require('express-session');
const passport = require('passport');
require('./config/passport')
const flash = require('connect-flash');


// port 
const PORT = process.env.PORT || 8000
const app = express();

// data base connection
connectDb(); 

app.set('view engine', 'ejs')
app.set('views', 'views')
  
app.use(cookieParser()); 
app.use('/user', express.static(path.join(__dirname, 'public', 'user')));
app.use('/admin', express.static(path.join(__dirname, 'public', 'admin')));
app.use(express.json())
app.use(express.urlencoded({extended: true}))
app.use(session({
  secret: process.env.SESSION_SECRET || 'secret_key',
  resave: false,
  saveUninitialized: false,
   cookie: { maxAge: 24 * 60 * 60 * 1000 }
})); 
app.use('/uploads', express.static('uploads'));

// clear cache
app.use((req, res, next) => {
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    next();
});
  
app.use(passport.initialize());
app.use(passport.session());
app.use(flash())  


app.use((req, res, next) => {
  res.locals.error = req.flash('error');
  next();
}) 
 
app.use('/', routes) 
 
app.listen(PORT, () => {
    console.log(`server is running at port ${PORT}`);
})  