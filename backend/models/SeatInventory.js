const mongoose = require('mongoose');

const seatInventorySchema = new mongoose.Schema({
    instance_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'FlightInstance',
        required: [true, 'Flight instance reference is required'],
        index: true
    },
    seat_number: {
        type: String,
        required: [true, 'Seat number is required (e.g., 1A)'],
        trim: true,
    },
    class_type: {
        type: String,
        enum: ['ECONOMY', 'PREMIUM_ECONOMY', 'BUSINESS', 'FIRST_CLASS'],
        required: [true, 'Class type is required']
    },
    fare_class: {
        type: String, // e.g., 'Y', 'C'
        required: [true, 'Fare class categorization is required'],
        trim: true
    },
    status: {
        type: String,
        enum: {
            values: ['AVAILABLE', 'RESERVED', 'BOOKED'],
            message: '{VALUE} is not a valid inventory status'
        },
        default: 'AVAILABLE',
        index: true
    },
    hold_expiry: {
        type: Date,
        default: null
    },
    version: {
        type: Number,
        default: 1
    }
}, {
    timestamps: true,
    // We explicitly disable the default mongoose __v field since we are implementing a custom `version` field for optimistic locking logic manually
    versionKey: false
});

// Create a compound unique index to prevent double booking of seats
seatInventorySchema.index({ instance_id: 1, seat_number: 1 }, { unique: true });

// Optimize query cleanups for expired seat holds using MongoDB TTL capability natively
seatInventorySchema.index({ hold_expiry: 1 }, { expireAfterSeconds: 0 });

const SeatInventory = mongoose.model('SeatInventory', seatInventorySchema);

module.exports = SeatInventory;
