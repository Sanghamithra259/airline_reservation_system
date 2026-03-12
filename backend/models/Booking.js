const mongoose = require('mongoose');

// Passenger Subdocument Schema
const passengerSchema = new mongoose.Schema({
    passenger_id: {
        type: mongoose.Schema.Types.ObjectId,
        default: () => new mongoose.Types.ObjectId()
    },
    first_name: {
        type: String,
        required: [true, 'First name is required'],
        trim: true
    },
    last_name: {
        type: String,
        required: [true, 'Last name is required'],
        trim: true
    },
    passport_number: {
        type: String,
        required: [true, 'Passport number is required'],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        lowercase: true,
        trim: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address']
    },
    phone: {
        type: String,
        required: [true, 'Phone number is required'],
        trim: true
    }
}, { _id: false });

// Ticket Subdocument Schema
const ticketSchema = new mongoose.Schema({
    instance_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'FlightInstance',
        required: [true, 'Flight instance reference is required']
    },
    seat_number: {
        type: String,
        required: [true, 'Seat number is required'],
        trim: true
    },
    fare_paid: {
        type: Number,
        required: [true, 'Fare paid is required'],
        min: [0, 'Fare cannot be negative']
    },
    ticket_status: {
        type: String,
        enum: {
            values: ['ACTIVE', 'CANCELLED', 'USED'],
            message: '{VALUE} is not a valid ticket status'
        },
        default: 'ACTIVE'
    }
}); // _id is true by default, useful for ticket_number references

// Payment Subdocument Schema
const paymentSchema = new mongoose.Schema({
    payment_id: {
        type: mongoose.Schema.Types.ObjectId,
        default: () => new mongoose.Types.ObjectId()
    },
    amount: {
        type: Number,
        required: [true, 'Payment amount is required'],
        min: [0, 'Amount cannot be negative']
    },
    currency: {
        type: String,
        required: [true, 'Currency is required'],
        uppercase: true,
        default: 'USD'
    },
    payment_method: {
        type: String,
        enum: {
            values: ['CARD', 'UPI', 'NETBANKING', 'WALLET'],
            message: '{VALUE} is not a valid payment method'
        },
        required: [true, 'Payment method is required']
    },
    payment_status: {
        type: String,
        enum: {
            values: ['PENDING', 'CAPTURED', 'FAILED', 'REFUNDED'],
            message: '{VALUE} is not a valid payment status'
        },
        default: 'PENDING'
    },
    transaction_reference: {
        type: String,
        unique: true,
        sparse: true,
        required: [true, 'Transaction reference is required'],
        trim: true
    },
    payment_datetime: {
        type: Date,
        default: Date.now
    }
}, { _id: false });

// Cancellation Subdocument Schema
const cancellationSchema = new mongoose.Schema({
    ticket_number: {
        type: String, // Can hold the _id of the ticket in string format or a generated number
        required: [true, 'Ticket number is required for cancellation']
    },
    cancellation_datetime: {
        type: Date,
        default: Date.now
    },
    penalty_amount: {
        type: Number,
        required: [true, 'Penalty amount is required'],
        min: [0, 'Penalty cannot be negative']
    },
    refund_amount: {
        type: Number,
        required: [true, 'Refund amount is required'],
        min: [0, 'Refund cannot be negative']
    },
    cancellation_reason: {
        type: String,
        trim: true
    }
}, { _id: false });

// Main Booking Schema
const bookingSchema = new mongoose.Schema({
    booking_reference: {
        type: String,
        required: [true, 'Booking reference is required'],
        unique: true,
        uppercase: true,
        trim: true,
        index: true
    },
    passengers: [passengerSchema],
    tickets: [ticketSchema],
    payments: [paymentSchema],
    cancellations: [cancellationSchema]
}, {
    timestamps: true
});

// Compound index on tickets.instance_id. 
// Note: While the prompt says 'compound index on tickets.instance_id', a single-field index 
// on an array field is technically a multikey index. However, the requirement is clearly 
// focused on fast flight-level booking lookups.
bookingSchema.index({ 'tickets.instance_id': 1 });

const Booking = mongoose.model('Booking', bookingSchema);

module.exports = Booking;
