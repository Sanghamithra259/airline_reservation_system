const mongoose = require('mongoose');

const aircraftModelSchema = new mongoose.Schema({
    model_name: {
        type: String,
        required: [true, 'Aircraft model name is required'],
        unique: true,
        trim: true,
    },
    manufacturer: {
        type: String,
        required: [true, 'Manufacturer name is required'],
        enum: {
            values: ['Boeing', 'Airbus', 'Embraer', 'Bombardier', 'ATR', 'Other'],
            message: '{VALUE} is not a supported manufacturer'
        },
    },
    typical_range_km: {
        type: Number,
        required: [true, 'Typical flight range in kilometers is required'],
        min: [0, 'Range must be a positive number'],
    },
    seating_capacity: {
        economy: {
            type: Number,
            default: 0,
            min: [0, 'Cannot have negative economy seats'],
            required: true
        },
        business: {
            type: Number,
            default: 0,
            min: [0, 'Cannot have negative business seats'],
            required: true
        },
        first_class: {
            type: Number,
            default: 0,
            min: [0, 'Cannot have negative first class seats'],
        }
    }
}, {
    timestamps: true
});

const AircraftModel = mongoose.model('AircraftModel', aircraftModelSchema);

module.exports = AircraftModel;
