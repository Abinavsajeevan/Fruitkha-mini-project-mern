require('dotenv').config()
const express = require('express');
const connectDb = require('./config/db');
const path = require('path');

const PORT = process.env.PORT || 8000;
const app = express();

// data base connection
connectDb();

app.set('view engine', 'ejs')
app.set('views', 'views')

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.render('index')
})
app.get('/about', (req, res) => {
    res.render('about')
})

 

 
app.listen(PORT, () => {
    console.log(`server is running at port ${PORT}`);
})