require('dotenv').config()
const express = require('express');
const connectDb = require('./config/db');
const path = require('path');

// all route files
const routes = require('./routes/index')

// port 
const PORT = process.env.PORT || 8000;
const app = express();

// data base connection
connectDb();

app.set('view engine', 'ejs')
app.set('views', 'views')

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json())
app.use(express.urlencoded({extended: true}))
 
app.use('/', routes)

app.listen(PORT, () => {
    console.log(`server is running at port ${PORT}`);
})