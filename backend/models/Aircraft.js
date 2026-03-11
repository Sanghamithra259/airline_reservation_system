const mongoose = require('mongoose');

// Embedded Seat Schema definition
const seatSchema = new mongoose.Schema({
    seat_number: {
        type: String,
        required: [true, 'Seat number is required (e.g., 1A)'],
        trim: true,
    },
    class_type: {
        type: String,
        required: [true, 'Class type is required'],
        enum: {
            values: ['ECONOMY', 'PREMIUM_ECONOMY', 'BUSINESS', 'FIRST_CLASS'],
            message: '{VALUE} is not a valid class type'
        },
    },
    is_window: {
        type: Boolean,
        default: false,
    },
    is_aisle: {
        type: Boolean,
        default: false,
    },
    is_exit_row: {
        type: Boolean,
        default: false,
    },
    features: [{
        type: String, // E.g., 'EXTRA_LEGROOM', 'POWER_OUTLET', 'FLAT_BED'
        enum: ['EXTRA_LEGROOM', 'POWER_OUTLET', 'FLAT_BED', 'BASSINET', 'WHEELCHAIR_ACCESSIBLE'],
    }]
}, { _id: true }); // Mongoose nested schema will auto-generate ObjectIds for each seat


// Aircraft Schema definition
const aircraftSchema = new mongoose.Schema({
    tail_number: {
        type: String,
        required: [true, 'Aircraft tail number is required'],
        unique: true,
        uppercase: true,
        trim: true,
    },
    model: {
        type: String,
        required: [true, 'Aircraft model name is required'],
        trim: true,
    },
    manufacturer: {
        type: String,
        required: [true, 'Manufacturer is required'],
        trim: true,
    },
    total_seats: {
        type: Number,
        required: [true, 'Total seats capacity is required'],
        min: [1, 'Must have at least 1 seat'],
    },
    status: {
        type: String,
        enum: {
            values: ['ACTIVE', 'INACTIVE', 'MAINTENANCE', 'RETIRED'],
            message: '{VALUE} is not a valid aircraft status'
        },
        default: 'ACTIVE',
    },
    seats: [seatSchema] // Array of embedded seats
}, {
    timestamps: true
});

// Indexes
aircraftSchema.index({ status: 1 });

const Aircraft = mongoose.model('Aircraft', aircraftSchema);

module.exports = Aircraft;
