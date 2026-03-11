const mongoose = require('mongoose');

const airportSchema = new mongoose.Schema({
    iata_code: {
        type: String,
        required: [true, 'IATA code is required'],
        unique: true,
        uppercase: true,
        trim: true,
        minlength: [3, 'IATA code must be exactly 3 characters'],
        maxlength: [3, 'IATA code must be exactly 3 characters'],
    },
    icao_code: {
        type: String,
        required: [true, 'ICAO code is required'],
        uppercase: true,
        trim: true,
        minlength: [4, 'ICAO code must be exactly 4 characters'],
        maxlength: [4, 'ICAO code must be exactly 4 characters'],
    },
    name: {
        type: String,
        required: [true, 'Airport name is required'],
        trim: true,
    },
    city: {
        type: String,
        required: [true, 'City name is required'],
        trim: true,
    },
    country: {
        type: String,
        required: [true, 'Country name is required'],
        trim: true,
    },
    timezone: {
        type: String,
        required: [true, 'Timezone is required'],
        trim: true,
    },
    location: {
        type: {
            type: String,
            enum: ['Point'],
            required: true,
            default: 'Point',
        },
        coordinates: {
            type: [Number], // [longitude, latitude]
            required: [true, 'Coordinates are required'],
            validate: {
                validator: function (v) {
                    // Check if it's an array of length 2
                    if (!Array.isArray(v) || v.length !== 2) return false;
                    // Verify valid range: Longitude [-180, 180], Latitude [-90, 90]
                    return v[0] >= -180 && v[0] <= 180 && v[1] >= -90 && v[1] <= 90;
                },
                message: 'Coordinates must be [longitude, latitude] in valid ranges.',
            },
        },
    },
    status: {
        type: String,
        enum: {
            values: ['ACTIVE', 'INACTIVE', 'MAINTENANCE'],
            message: '{VALUE} is not a valid status',
        },
        default: 'ACTIVE',
    },
}, {
    timestamps: true
});

// Geospatial Index for 2dsphere location searches
airportSchema.index({ location: '2dsphere' });
// City Index for quick search
airportSchema.index({ city: 1 });

const Airport = mongoose.model('Airport', airportSchema);

module.exports = Airport;
