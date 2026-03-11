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
        const bom = await Airport.create({ iata_code: 'BOM', icao_code: 'VABB', name: 'Chhatrapati Shivaji Maharaj', city: 'Mumbai', country: 'India', timezone: 'Asia/Kolkata', location: { type: 'Point', coordinates: [72.8679, 19.0886] } });
        const blr = await Airport.create({ iata_code: 'BLR', icao_code: 'VOBL', name: 'Kempegowda', city: 'Bangalore', country: 'India', timezone: 'Asia/Kolkata', location: { type: 'Point', coordinates: [77.7063, 13.1994] } });
        const sin = await Airport.create({ iata_code: 'SIN', icao_code: 'WSSS', name: 'Changi', city: 'Singapore', country: 'Singapore', timezone: 'Asia/Singapore', location: { type: 'Point', coordinates: [103.9894, 1.3501] } });
        const dxb = await Airport.create({ iata_code: 'DXB', icao_code: 'OMDB', name: 'Dubai', city: 'Dubai', country: 'United Arab Emirates', timezone: 'Asia/Dubai', location: { type: 'Point', coordinates: [55.3644, 25.2532] } });
        const lhr = await Airport.create({ iata_code: 'LHR', icao_code: 'EGLL', name: 'Heathrow', city: 'London', country: 'UK', timezone: 'Europe/London', location: { type: 'Point', coordinates: [-0.4543, 51.4700] } });
        const jfk = await Airport.create({ iata_code: 'JFK', icao_code: 'KJFK', name: 'John F. Kennedy', city: 'New York', country: 'USA', timezone: 'America/New_York', location: { type: 'Point', coordinates: [-73.7781, 40.6413] } });
        const syd = await Airport.create({ iata_code: 'SYD', icao_code: 'YSSY', name: 'Sydney Kingsford Smith', city: 'Sydney', country: 'Australia', timezone: 'Australia/Sydney', location: { type: 'Point', coordinates: [151.1772, -33.9399] } });

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
        const a320 = await Aircraft.create({
            tail_number: 'VT-ANB',
            model: 'Airbus A320',
            manufacturer: 'Airbus',
            total_seats: 162,
            status: 'ACTIVE',
            seats: seats
        });

        console.log('Inserting Flights...');
        const flightsData = [
            // MAA -> DEL
            { flight_number: 'ARD101', origin_airport_id: maa._id, destination_airport_id: del._id, scheduled_departure_time: '09:00', scheduled_arrival_time: '11:30', duration_minutes: 150, days_of_operation: ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'], effective_from: new Date('2026-01-01'), effective_to: new Date('2026-12-31'), status: 'ACTIVE' },
            { flight_number: 'ARD103', origin_airport_id: maa._id, destination_airport_id: del._id, scheduled_departure_time: '18:15', scheduled_arrival_time: '20:50', duration_minutes: 155, days_of_operation: ['MON', 'WED', 'FRI', 'SUN'], effective_from: new Date('2026-01-01'), effective_to: new Date('2026-12-31'), status: 'ACTIVE' },
            // DEL -> MAA
            { flight_number: 'ARD102', origin_airport_id: del._id, destination_airport_id: maa._id, scheduled_departure_time: '06:00', scheduled_arrival_time: '08:45', duration_minutes: 165, days_of_operation: ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'], effective_from: new Date('2026-01-01'), effective_to: new Date('2026-12-31'), status: 'ACTIVE' },
            // DEL -> BOM
            { flight_number: 'ARD301', origin_airport_id: del._id, destination_airport_id: bom._id, scheduled_departure_time: '07:30', scheduled_arrival_time: '09:40', duration_minutes: 130, days_of_operation: ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'], effective_from: new Date('2026-01-01'), effective_to: new Date('2026-12-31'), status: 'ACTIVE' },
            { flight_number: 'ARD303', origin_airport_id: del._id, destination_airport_id: bom._id, scheduled_departure_time: '20:00', scheduled_arrival_time: '22:15', duration_minutes: 135, days_of_operation: ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'], effective_from: new Date('2026-01-01'), effective_to: new Date('2026-12-31'), status: 'ACTIVE' },
            // BOM -> DEL
            { flight_number: 'ARD302', origin_airport_id: bom._id, destination_airport_id: del._id, scheduled_departure_time: '08:00', scheduled_arrival_time: '10:05', duration_minutes: 125, days_of_operation: ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'], effective_from: new Date('2026-01-01'), effective_to: new Date('2026-12-31'), status: 'ACTIVE' },
            // BOM -> BLR
            { flight_number: 'ARD401', origin_airport_id: bom._id, destination_airport_id: blr._id, scheduled_departure_time: '10:15', scheduled_arrival_time: '11:55', duration_minutes: 100, days_of_operation: ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'], effective_from: new Date('2026-01-01'), effective_to: new Date('2026-12-31'), status: 'ACTIVE' },
            // DEL -> NRT (International)
            { flight_number: 'ARD801', origin_airport_id: del._id, destination_airport_id: nrt._id, scheduled_departure_time: '22:00', scheduled_arrival_time: '08:30', duration_minutes: 510, days_of_operation: ['TUE', 'THU', 'SAT'], effective_from: new Date('2026-01-01'), effective_to: new Date('2026-12-31'), status: 'ACTIVE' },
            // NRT -> DEL (International)
            { flight_number: 'ARD802', origin_airport_id: nrt._id, destination_airport_id: del._id, scheduled_departure_time: '11:00', scheduled_arrival_time: '17:30', duration_minutes: 570, days_of_operation: ['WED', 'FRI', 'SUN'], effective_from: new Date('2026-01-01'), effective_to: new Date('2026-12-31'), status: 'ACTIVE' },
            // BOM -> LHR (International)
            { flight_number: 'ARD901', origin_airport_id: bom._id, destination_airport_id: lhr._id, scheduled_departure_time: '14:00', scheduled_arrival_time: '19:15', duration_minutes: 615, days_of_operation: ['MON', 'WED', 'FRI', 'SUN'], effective_from: new Date('2026-01-01'), effective_to: new Date('2026-12-31'), status: 'ACTIVE' },
            // LHR -> JFK (International)
            { flight_number: 'ARD905', origin_airport_id: lhr._id, destination_airport_id: jfk._id, scheduled_departure_time: '10:00', scheduled_arrival_time: '13:00', duration_minutes: 480, days_of_operation: ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'], effective_from: new Date('2026-01-01'), effective_to: new Date('2026-12-31'), status: 'ACTIVE' },
            // MAA -> SIN (International)
            { flight_number: 'ARD501', origin_airport_id: maa._id, destination_airport_id: sin._id, scheduled_departure_time: '11:45', scheduled_arrival_time: '18:35', duration_minutes: 260, days_of_operation: ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'], effective_from: new Date('2026-01-01'), effective_to: new Date('2026-12-31'), status: 'ACTIVE' },
            // BLR -> DXB (International)
            { flight_number: 'ARD601', origin_airport_id: blr._id, destination_airport_id: dxb._id, scheduled_departure_time: '19:10', scheduled_arrival_time: '21:40', duration_minutes: 240, days_of_operation: ['TUE', 'THU', 'SAT', 'SUN'], effective_from: new Date('2026-01-01'), effective_to: new Date('2026-12-31'), status: 'ACTIVE' }
        ];

        await Flight.create(flightsData);

        console.log('Seed completed successfully!');
        process.exit();
    } catch (error) {
        console.error('Seeding failed:', error);
        process.exit(1);
    }
};

seedDB();
