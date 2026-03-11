const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        // Replace the URL with your MongoDB URI
        // e.g., process.env.MONGO_URI || 'mongodb://localhost:27017/ardps'
        const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/ardps');

        console.log(`[ARDPS Database] MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`[ARDPS Database] Error: ${error.message}`);
        process.exit(1);
    }
};

module.exports = connectDB;
