require('dotenv').config()
const express = require('express');
const connectDb = require('./config/db')

const app = express();
const PORT = process.env.PORT || 8000;

connectDb();

app.get('/', (req, res) => {
    res.send('server running successfully');
})




app.listen(PORT, () => {
    console.log(`server is running at port ${PORT}`);
})