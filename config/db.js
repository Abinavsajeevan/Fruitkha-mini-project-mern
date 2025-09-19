const mongoose = require('mongoose');

const URI = process.env.DB_URI; 

const dbConnect = async() => {
    try {
    await mongoose.connect(URI);
    console.log(`✅database connected Succesfully`);
    } catch ( err ) {
        console.error(`❌fail to connect Database error: ${ err }`);
    }
}

module.exports = dbConnect;