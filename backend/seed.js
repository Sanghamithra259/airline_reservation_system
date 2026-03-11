const mongoose = require('mongoose');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

const Airport = require('./models/Airport');
const AircraftModel = require('./models/AircraftModel');
const Aircraft = require('./models/Aircraft');
const Flight = require('./models/Flight');

dotenv.config();

const seedDB = async () => {
    try {
        await connectDB();

        console.log('Clearing old data...');
        await Airport.deleteMany();
        await AircraftModel.deleteMany();
        await Aircraft.deleteMany();
        await Flight.deleteMany();

        console.log('Inserting AircraftModels...');
        await AircraftModel.create([
            { model_name: 'Boeing 737-800', manufacturer: 'Boeing', typical_range_km: 5600, seating_capacity: { economy: 150, business: 12 } },
            { model_name: 'Airbus A320', manufacturer: 'Airbus', typical_range_km: 6100, seating_capacity: { economy: 150, business: 12 } }
        ]);

        console.log('Inserting Airports...');
        const nrt = await Airport.create({ iata_code: 'NRT', icao_code: 'RJAA', name: 'Narita', city: 'Tokyo', country: 'Japan', timezone: 'Asia/Tokyo', location: { type: 'Point', coordinates: [140.3929, 35.7719] } });
        const maa = await Airport.create({ iata_code: 'MAA', icao_code: 'VOMM', name: 'Chennai', city: 'Chennai', country: 'India', timezone: 'Asia/Kolkata', location: { type: 'Point', coordinates: [80.1693, 12.9941] } });
        const del = await Airport.create({ iata_code: 'DEL', icao_code: 'VIDP', name: 'Delhi', city: 'Delhi', country: 'India', timezone: 'Asia/Kolkata', location: { type: 'Point', coordinates: [77.1025, 28.5562] } });

        console.log('Inserting Aircraft and Seats...');
        const seats = [];

        // Business Class (Rows 1-3) 2-2 Layout
        for (let r = 1; r <= 3; r++) {
            ['A', 'C', 'D', 'F'].forEach(l => {
                seats.push({
                    seat_number: `${r}${l}`,
                    class_type: 'BUSINESS',
                    is_window: l === 'A' || l === 'F',
                    is_aisle: l === 'C' || l === 'D',
                    is_exit_row: false,
                    features: ['EXTRA_LEGROOM', 'POWER_OUTLET', 'FLAT_BED']
                });
            });
        }

        // Economy Class (Rows 11-20) 3-3 Layout
        for (let r = 11; r <= 20; r++) {
            ['A', 'B', 'C', 'D', 'E', 'F'].forEach(l => {
                seats.push({
                    seat_number: `${r}${l}`,
                    class_type: 'ECONOMY',
                    is_window: l === 'A' || l === 'F',
                    is_aisle: l === 'C' || l === 'D',
                    is_exit_row: r === 15,
                    features: r === 15 ? ['EXTRA_LEGROOM'] : []
                });
            });
        }

        const aircraft = await Aircraft.create({
            tail_number: 'JA123A',
            model: 'Boeing 737-800',
            manufacturer: 'Boeing',
            total_seats: 72,
            status: 'ACTIVE',
            seats: seats
        });

        console.log('Inserting Flights...');
        await Flight.create([
            {
                flight_number: 'ARD101',
                origin_airport_id: maa._id,
                destination_airport_id: del._id,
                scheduled_departure_time: '09:00',
                scheduled_arrival_time: '11:30',
                duration_minutes: 150,
                days_of_operation: ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'],
                effective_from: new Date('2026-01-01'),
                effective_to: new Date('2026-12-31'),
                status: 'ACTIVE'
            },
            {
                flight_number: 'ARD202',
                origin_airport_id: del._id,
                destination_airport_id: nrt._id,
                scheduled_departure_time: '22:00',
                scheduled_arrival_time: '08:30',
                duration_minutes: 510,
                days_of_operation: ['TUE', 'THU', 'SAT'],
                effective_from: new Date('2026-01-01'),
                effective_to: new Date('2026-12-31'),
                status: 'ACTIVE'
            }
        ]);

        console.log('Seed completed successfully!');
        process.exit();
    } catch (error) {
        console.error('Seeding failed:', error);
        process.exit(1);
    }
};

seedDB();
