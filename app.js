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



// port 
const PORT = process.env.PORT || 8000;
const app = express();

// data base connection
connectDb();

app.set('view engine', 'ejs')
app.set('views', 'views')

app.use(cookieParser()); 
app.use('/user', express.static(path.join(__dirname, 'public', 'user')));
app.use('/admin', express.static(path.join(__dirname, 'public', 'user')));
app.use(express.json())
app.use(express.urlencoded({extended: true}))
app.use(session({
  secret: process.env.SESSION_SECRET || 'secret_key',
  resave: false,
  saveUninitialized: false
})); 

app.use(passport.initialize());
app.use(passport.session());

app.use('/', routes)

app.listen(PORT, () => {
    console.log(`server is running at port ${PORT}`);
})