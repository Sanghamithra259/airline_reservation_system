const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// Import all Mongoose models
const Airport = require('./models/Airport');
const AircraftModel = require('./models/AircraftModel');
const Aircraft = require('./models/Aircraft');
const Flight = require('./models/Flight');

// Load env variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();
app.use(express.json());

// Basic sanity check route
app.get('/', (req, res) => {
    res.status(200).json({
        message: 'Welcome to ARDPS (Airline Reservation and Dynamic Pricing System) API',
        status: 'Running',
        models_loaded: ['Airport', 'AircraftModel', 'Aircraft', 'Flight']
    });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`[ARDPS Server] Node.js backend listening on port ${PORT}`);
});

module.exports = app;
