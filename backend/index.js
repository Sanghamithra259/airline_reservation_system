const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
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
app.use(cors()); // Allow CORS so frontend can communicate with backend!

// Basic sanity check route
app.get('/', (req, res) => {
    res.status(200).json({
        message: 'Welcome to ARDPS (Airline Reservation and Dynamic Pricing System) API',
        status: 'Running',
        models_loaded: ['Airport', 'AircraftModel', 'Aircraft', 'Flight']
    });
});

// GET /api/flights/search?from=IATA&to=IATA&date=YYYY-MM-DD
app.get('/api/flights/search', async (req, res) => {
    try {
        const { from, to, date } = req.query;
        if (!from || !to) return res.status(400).json({ error: 'from and to are required' });

        const origin = await Airport.findOne({ iata_code: from.toUpperCase() });
        const dest = await Airport.findOne({ iata_code: to.toUpperCase() });

        if (!origin || !dest) return res.json([]); // Return empty if no airports match

        const flights = await Flight.find({
            origin_airport_id: origin._id,
            destination_airport_id: dest._id
        }).populate('origin_airport_id destination_airport_id');

        // Note: Realistically flights map to FlightInstances which map to Aircraft. 
        // We'll mock the assignment here by grabbing the first Aircraft to link for testing.
        const aircraft = await Aircraft.findOne({});

        const results = flights.map(f => ({
            id: f._id,
            flight_number: f.flight_number,
            origin: origin.iata_code,
            destination: dest.iata_code,
            departure: f.scheduled_departure_time,
            arrival: f.scheduled_arrival_time,
            duration: `${Math.floor(f.duration_minutes / 60)}h ${f.duration_minutes % 60}m`,
            price: 12000,
            aircraftId: aircraft ? aircraft._id : null
        }));

        res.json(results);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// GET /api/aircraft/:id
app.get('/api/aircraft/:id', async (req, res) => {
    try {
        const aircraft = await Aircraft.findById(req.params.id);
        if (!aircraft) return res.status(404).json({ error: 'Aircraft not found' });
        res.json(aircraft);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`[ARDPS Server] Node.js backend listening on port ${PORT}`);
});

module.exports = app;
