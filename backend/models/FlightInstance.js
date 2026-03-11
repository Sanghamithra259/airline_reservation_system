const mongoose = require('mongoose');

// Embedded Pricing Model Schema
const pricingModelSchema = new mongoose.Schema({
    fare_class: {
        type: String,
        required: [true, 'Fare class is required (e.g., Y, C, Q)'],
        trim: true,
    },
    cabin_type: {
        type: String,
        enum: ['ECONOMY', 'PREMIUM_ECONOMY', 'BUSINESS', 'FIRST_CLASS'],
        required: [true, 'Cabin type is required']
    },
    base_price: {
        type: Number,
        required: [true, 'Base price is required'],
        min: [0, 'Base price cannot be negative']
    },
    seats_total: {
        type: Number,
        required: [true, 'Total seats for this fare class required'],
        min: [0, 'Seats total cannot be negative']
    },
    seats_sold: {
        type: Number,
        default: 0,
        min: [0, 'Seats sold cannot be negative']
    },
    occupancy_rate: {
        type: Number,
        default: 0,
        min: [0, 'Occupancy rate cannot be less than 0'],
        max: [1, 'Occupancy rate cannot be greater than 1']
    },
    time_to_departure_hours: {
        type: Number,
        default: 0
    },
    demand_multiplier: {
        type: Number,
        default: 1.0,
        min: [1.0, 'Multiplier cannot drop below 1.0 (base price)']
    },
    last_updated: {
        type: Date,
        default: Date.now
    }
}, { _id: false });


// Flight Instance Schema definition
const flightInstanceSchema = new mongoose.Schema({
    flight_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Flight',
        required: [true, 'Flight reference is required'],
        index: true
    },
    aircraft_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Aircraft',
        required: [true, 'Aircraft reference is required']
    },
    departure_datetime: {
        type: Date,
        required: [true, 'Departure datetime is required'],
        index: true
    },
    arrival_datetime: {
        type: Date,
        required: [true, 'Arrival datetime is required']
    },
    status: {
        type: String,
        enum: {
            values: ['SCHEDULED', 'DELAYED', 'CANCELLED', 'COMPLETED'],
            message: '{VALUE} is not a valid status'
        },
        default: 'SCHEDULED'
    },
    gate: {
        type: String,
        trim: true
    },
    pricing_model: [pricingModelSchema]
}, {
    timestamps: true
});

const FlightInstance = mongoose.model('FlightInstance', flightInstanceSchema);

module.exports = FlightInstance;
