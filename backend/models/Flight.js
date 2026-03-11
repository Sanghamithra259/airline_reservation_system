const mongoose = require('mongoose');

const flightSchema = new mongoose.Schema({
    flight_number: {
        type: String,
        required: [true, 'Flight number is required'],
        uppercase: true,
        trim: true,
        index: true,
    },
    origin_airport_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Airport', // References the Airport Mongoose Model
        required: [true, 'Origin airport is required'],
    },
    destination_airport_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Airport', // References the Airport Mongoose Model
        required: [true, 'Destination airport is required'],
    },
    scheduled_departure_time: {
        type: String,
        required: [true, 'Departure time required (e.g., 09:00)'],
        match: [/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, 'Time must be in HH:MM format'],
    },
    scheduled_arrival_time: {
        type: String,
        required: [true, 'Arrival time required (e.g., 11:30)'],
        match: [/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/, 'Time must be in HH:MM format'],
    },
    duration_minutes: {
        type: Number,
        required: [true, 'Duration in minutes is required'],
        min: [1, 'Duration must be greater than 0'],
    },
    days_of_operation: [{
        type: String,
        required: true,
        enum: {
            values: ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'],
            message: '{VALUE} is not a valid day of the week'
        }
    }],
    effective_from: {
        type: Date,
        required: [true, 'Effective from Date is required'],
    },
    effective_to: {
        type: Date,
        required: [true, 'Effective to Date is required'],
        validate: {
            validator: function (v) {
                return v >= this.effective_from;
            },
            message: 'Effective-To Date must be equal to or after Effective-From Date',
        }
    },
    status: {
        type: String,
        enum: {
            values: ['ACTIVE', 'SUSPENDED', 'CANCELLED'],
            message: '{VALUE} is not a valid flight status'
        },
        default: 'ACTIVE',
    }
}, {
    timestamps: true
});

// Compound index for frequent routing searches
flightSchema.index({ origin_airport_id: 1, destination_airport_id: 1 });

const Flight = mongoose.model('Flight', flightSchema);

module.exports = Flight;
