// ============================================================
// ARDPS - Airline Reservation and Dynamic Pricing System
// MongoDB Schema, Indexes, Sharding & Operations
// ============================================================

// ─────────────────────────────────────────────
// 0. DATABASE SETUP
// ─────────────────────────────────────────────
db = db.getSiblingDB('ardps');

// ─────────────────────────────────────────────
// 1. COLLECTION: airports
// ─────────────────────────────────────────────
db.createCollection("airports");

db.airports.insertMany([
  {
    iata_code: "NRT",
    icao_code: "RJAA",
    name: "Narita International Airport",
    city: "Tokyo",
    country: "Japan",
    timezone: "Asia/Tokyo",
    location: {
      type: "Point",
      coordinates: [140.3929, 35.7719]
    },
    status: "ACTIVE"
  },
  {
    iata_code: "MAA",
    icao_code: "VOMM",
    name: "Chennai International Airport",
    city: "Chennai",
    country: "India",
    timezone: "Asia/Kolkata",
    location: {
      type: "Point",
      coordinates: [80.1693, 12.9941]
    },
    status: "ACTIVE"
  },
  {
    iata_code: "DEL",
    icao_code: "VIDP",
    name: "Indira Gandhi International Airport",
    city: "Delhi",
    country: "India",
    timezone: "Asia/Kolkata",
    location: {
      type: "Point",
      coordinates: [77.1025, 28.5562]
    },
    status: "ACTIVE"
  }
]);

// Indexes for airports
db.airports.createIndex({ iata_code: 1 }, { unique: true });
db.airports.createIndex({ city: 1 });
db.airports.createIndex({ location: "2dsphere" });


// ─────────────────────────────────────────────
// 2. COLLECTION: aircraft_models
// ─────────────────────────────────────────────
db.createCollection("aircraft_models");

db.aircraft_models.insertMany([
  {
    model_name: "Boeing 737-800",
    manufacturer: "Boeing",
    typical_range_km: 5600,
    seating_capacity: {
      economy: 150,
      business: 12
    }
  },
  {
    model_name: "Airbus A320",
    manufacturer: "Airbus",
    typical_range_km: 6100,
    seating_capacity: {
      economy: 150,
      business: 12
    }
  }
]);

db.aircraft_models.createIndex({ model_name: 1 });


// ─────────────────────────────────────────────
// 3. COLLECTION: aircraft (with embedded seats)
// ─────────────────────────────────────────────
db.createCollection("aircraft");

db.aircraft.insertMany([
  {
    tail_number: "JA123A",
    model: "Boeing 737-800",
    manufacturer: "Boeing",
    total_seats: 162,
    status: "ACTIVE",
    created_at: new Date(),
    seats: [
      {
        seat_id: new ObjectId(),
        seat_number: "1A",
        class_type: "BUSINESS",
        is_window: true,
        is_aisle: false,
        is_exit_row: false,
        features: [
          { feature_name: "POWER_OUTLET" },
          { feature_name: "EXTRA_LEGROOM" },
          { feature_name: "RECLINER" }
        ]
      },
      {
        seat_id: new ObjectId(),
        seat_number: "12A",
        class_type: "ECONOMY",
        is_window: true,
        is_aisle: false,
        is_exit_row: false,
        features: [
          { feature_name: "POWER_OUTLET" }
        ]
      },
      {
        seat_id: new ObjectId(),
        seat_number: "12B",
        class_type: "ECONOMY",
        is_window: false,
        is_aisle: false,
        is_exit_row: false,
        features: []
      },
      {
        seat_id: new ObjectId(),
        seat_number: "12C",
        class_type: "ECONOMY",
        is_window: false,
        is_aisle: true,
        is_exit_row: false,
        features: [
          { feature_name: "EXTRA_LEGROOM" }
        ]
      }
    ]
  },
  {
    tail_number: "VT-ANB",
    model: "Airbus A320",
    manufacturer: "Airbus",
    total_seats: 162,
    status: "ACTIVE",
    created_at: new Date(),
    seats: [
      {
        seat_id: new ObjectId(),
        seat_number: "1A",
        class_type: "BUSINESS",
        is_window: true,
        is_aisle: false,
        is_exit_row: false,
        features: [
          { feature_name: "POWER_OUTLET" },
          { feature_name: "RECLINER" }
        ]
      },
      {
        seat_id: new ObjectId(),
        seat_number: "15A",
        class_type: "ECONOMY",
        is_window: true,
        is_aisle: false,
        is_exit_row: true,
        features: [
          { feature_name: "EXTRA_LEGROOM" }
        ]
      }
    ]
  }
]);

// Indexes for aircraft
db.aircraft.createIndex({ tail_number: 1 }, { unique: true });
db.aircraft.createIndex({ status: 1 });


// ─────────────────────────────────────────────
// 4. COLLECTION: fare_classes
// ─────────────────────────────────────────────
db.createCollection("fare_classes");

db.fare_classes.insertMany([
  {
    class_code: "Y",
    cabin_type: "ECONOMY",
    base_price: 12000,
    refundable: false,
    baggage_allowance_kg: 20
  },
  {
    class_code: "C",
    cabin_type: "BUSINESS",
    base_price: 45000,
    refundable: true,
    baggage_allowance_kg: 40
  },
  {
    class_code: "Q",
    cabin_type: "ECONOMY",
    base_price: 8000,
    refundable: false,
    baggage_allowance_kg: 15
  }
]);

db.fare_classes.createIndex({ class_code: 1 }, { unique: true });
db.fare_classes.createIndex({ cabin_type: 1 });


// ─────────────────────────────────────────────
// 5. COLLECTION: flights (Template Level)
// ─────────────────────────────────────────────
db.createCollection("flights");

// Fetch airport IDs first (in real usage, store the ObjectIds)
var nrtId = db.airports.findOne({ iata_code: "NRT" })._id;
var maaId = db.airports.findOne({ iata_code: "MAA" })._id;
var delId = db.airports.findOne({ iata_code: "DEL" })._id;

db.flights.insertMany([
  {
    flight_number: "ARD101",
    origin_airport_id: maaId,
    destination_airport_id: delId,
    scheduled_departure_time: "09:00",
    scheduled_arrival_time: "11:30",
    duration_minutes: 150,
    days_of_operation: ["MON", "WED", "FRI", "SUN"],
    effective_from: new Date("2026-01-01"),
    effective_to: new Date("2026-12-31"),
    status: "ACTIVE"
  },
  {
    flight_number: "ARD202",
    origin_airport_id: delId,
    destination_airport_id: nrtId,
    scheduled_departure_time: "22:00",
    scheduled_arrival_time: "08:30",
    duration_minutes: 510,
    days_of_operation: ["TUE", "THU", "SAT"],
    effective_from: new Date("2026-01-01"),
    effective_to: new Date("2026-12-31"),
    status: "ACTIVE"
  }
]);

// Indexes for flights
db.flights.createIndex({ flight_number: 1 });
db.flights.createIndex({ origin_airport_id: 1, destination_airport_id: 1 });
db.flights.createIndex({ status: 1 });


// ─────────────────────────────────────────────
// 6. COLLECTION: flight_instances (Core Transaction Collection)
//    Embedded: seat_inventory + pricing_model
// ─────────────────────────────────────────────
db.createCollection("flight_instances");

var flight101 = db.flights.findOne({ flight_number: "ARD101" });
var aircraft1 = db.aircraft.findOne({ tail_number: "JA123A" });

db.flight_instances.insertMany([
  {
    flight_id: flight101._id,
    flight_number: "ARD101",
    aircraft_id: aircraft1._id,
    origin_airport_id: maaId,
    destination_airport_id: delId,
    departure_datetime: new Date("2026-03-20T09:00:00Z"),
    arrival_datetime: new Date("2026-03-20T11:30:00Z"),
    status: "SCHEDULED",
    gate: "A12",
    created_at: new Date(),

    // Embedded seat inventory
    seat_inventory: [
      {
        seat_id: new ObjectId(),
        seat_number: "12A",
        fare_class: "Y",
        status: "AVAILABLE",
        version_no: 1,
        reserved_at: null,
        booked_at: null
      },
      {
        seat_id: new ObjectId(),
        seat_number: "12B",
        fare_class: "Y",
        status: "AVAILABLE",
        version_no: 1,
        reserved_at: null,
        booked_at: null
      },
      {
        seat_id: new ObjectId(),
        seat_number: "1A",
        fare_class: "C",
        status: "AVAILABLE",
        version_no: 1,
        reserved_at: null,
        booked_at: null
      }
    ],

    // Embedded pricing model
    pricing_model: [
      {
        fare_class: "Y",
        cabin_type: "ECONOMY",
        base_price: 12000,
        seats_total: 150,
        seats_sold: 45,
        occupancy_rate: 0.30,
        time_to_departure_hours: 72,
        demand_multiplier: 1.20,
        last_updated: new Date()
      },
      {
        fare_class: "C",
        cabin_type: "BUSINESS",
        base_price: 45000,
        seats_total: 12,
        seats_sold: 3,
        occupancy_rate: 0.25,
        time_to_departure_hours: 72,
        demand_multiplier: 1.10,
        last_updated: new Date()
      }
    ]
  },
  {
    flight_id: flight101._id,
    flight_number: "ARD101",
    aircraft_id: aircraft1._id,
    origin_airport_id: maaId,
    destination_airport_id: delId,
    departure_datetime: new Date("2026-03-22T09:00:00Z"),
    arrival_datetime: new Date("2026-03-22T11:30:00Z"),
    status: "SCHEDULED",
    gate: "B5",
    created_at: new Date(),
    seat_inventory: [
      {
        seat_id: new ObjectId(),
        seat_number: "12A",
        fare_class: "Y",
        status: "AVAILABLE",
        version_no: 1,
        reserved_at: null,
        booked_at: null
      }
    ],
    pricing_model: [
      {
        fare_class: "Y",
        cabin_type: "ECONOMY",
        base_price: 12000,
        seats_total: 150,
        seats_sold: 120,
        occupancy_rate: 0.80,
        time_to_departure_hours: 96,
        demand_multiplier: 1.80,
        last_updated: new Date()
      }
    ]
  }
]);

// Indexes for flight_instances
db.flight_instances.createIndex({ flight_id: 1 });
db.flight_instances.createIndex({ departure_datetime: 1 });
db.flight_instances.createIndex({ origin_airport_id: 1, departure_datetime: 1 });
db.flight_instances.createIndex({ status: 1 });
db.flight_instances.createIndex({ "seat_inventory.status": 1 });


// ─────────────────────────────────────────────
// 7. COLLECTION: seat_inventory (Separate High-Write Collection)
//    Used for concurrent seat booking operations
// ─────────────────────────────────────────────
db.createCollection("seat_inventory");

var instance1 = db.flight_instances.findOne({ flight_number: "ARD101" });

db.seat_inventory.insertMany([
  {
    instance_id: instance1._id,
    seat_number: "12A",
    class_type: "ECONOMY",
    fare_class: "Y",
    status: "AVAILABLE",
    hold_expiry: null,
    version: 1
  },
  {
    instance_id: instance1._id,
    seat_number: "12B",
    class_type: "ECONOMY",
    fare_class: "Y",
    status: "AVAILABLE",
    hold_expiry: null,
    version: 1
  },
  {
    instance_id: instance1._id,
    seat_number: "12C",
    class_type: "ECONOMY",
    fare_class: "Y",
    status: "AVAILABLE",
    hold_expiry: null,
    version: 1
  },
  {
    instance_id: instance1._id,
    seat_number: "1A",
    class_type: "BUSINESS",
    fare_class: "C",
    status: "AVAILABLE",
    hold_expiry: null,
    version: 1
  }
]);

// CRITICAL: Prevent double booking
db.seat_inventory.createIndex(
  { instance_id: 1, seat_number: 1 },
  { unique: true }
);
// Optimise seat availability queries
db.seat_inventory.createIndex({ instance_id: 1, status: 1 });
db.seat_inventory.createIndex({ hold_expiry: 1 }, { expireAfterSeconds: 0 });


// ─────────────────────────────────────────────
// 8. COLLECTION: bookings (Aggregate Root)
//    Embedded: passengers, tickets, payments, cancellations
// ─────────────────────────────────────────────
db.createCollection("bookings");

db.bookings.insertMany([
  {
    booking_reference: "PNR12345",
    booking_datetime: new Date("2026-02-15T12:00:00Z"),
    status: "CONFIRMED",
    total_amount: 30000,
    currency: "INR",

    passengers: [
      {
        passenger_id: new ObjectId(),
        first_name: "Sanjay",
        last_name: "S",
        passport_number: "A12345678",
        email: "sanjay@example.com",
        phone: "+919000000001",
        ticket: {
          ticket_number: "TK00000001",
          instance_id: instance1._id,
          seat_number: "12A",
          fare_class: "Y",
          fare_paid: 15000,
          ticket_status: "ACTIVE"
        }
      },
      {
        passenger_id: new ObjectId(),
        first_name: "Sanghamithra",
        last_name: "N",
        passport_number: "B98765432",
        email: "sanghamithra@example.com",
        phone: "+919000000002",
        ticket: {
          ticket_number: "TK00000002",
          instance_id: instance1._id,
          seat_number: "12B",
          fare_class: "Y",
          fare_paid: 15000,
          ticket_status: "ACTIVE"
        }
      }
    ],

    payments: [
      {
        payment_id: new ObjectId(),
        amount: 30000,
        currency: "INR",
        payment_method: "CARD",
        payment_status: "CAPTURED",
        transaction_reference: "TXN987654",
        payment_datetime: new Date("2026-02-15T12:05:00Z")
      }
    ],

    cancellations: []
  },
  {
    booking_reference: "PNR67890",
    booking_datetime: new Date("2026-02-18T14:00:00Z"),
    status: "CANCELLED",
    total_amount: 12000,
    currency: "INR",

    passengers: [
      {
        passenger_id: new ObjectId(),
        first_name: "Praveen",
        last_name: "Kumar",
        passport_number: "C11223344",
        email: "praveen@example.com",
        phone: "+919000000003",
        ticket: {
          ticket_number: "TK00000003",
          instance_id: instance1._id,
          seat_number: "12C",
          fare_class: "Y",
          fare_paid: 12000,
          ticket_status: "CANCELLED"
        }
      }
    ],

    payments: [
      {
        payment_id: new ObjectId(),
        amount: 12000,
        currency: "INR",
        payment_method: "UPI",
        payment_status: "REFUNDED",
        transaction_reference: "TXN112233",
        payment_datetime: new Date("2026-02-18T14:05:00Z")
      }
    ],

    cancellations: [
      {
        ticket_number: "TK00000003",
        cancellation_datetime: new Date("2026-02-19T10:00:00Z"),
        penalty_amount: 2000,
        refund_amount: 10000,
        cancellation_reason: "Passenger request"
      }
    ]
  }
]);

// Indexes for bookings
db.bookings.createIndex({ booking_reference: 1 }, { unique: true });
db.bookings.createIndex({ "passengers.passport_number": 1 });
db.bookings.createIndex({ "passengers.ticket.instance_id": 1 });
db.bookings.createIndex(
  { "payments.transaction_reference": 1 },
  { unique: true, sparse: true }
);
db.bookings.createIndex({ status: 1 });
db.bookings.createIndex({ booking_datetime: -1 });


// ─────────────────────────────────────────────
// 9. COLLECTION: pricing_audit (optional)
//    Tracks all pricing changes for analytics
// ─────────────────────────────────────────────
db.createCollection("pricing_audit");

db.pricing_audit.insertOne({
  instance_id: instance1._id,
  flight_number: "ARD101",
  fare_class: "Y",
  old_multiplier: 1.10,
  new_multiplier: 1.20,
  old_price: 13200,
  new_price: 14400,
  reason: "Occupancy crossed 30%",
  updated_at: new Date()
});

db.pricing_audit.createIndex({ instance_id: 1 });
db.pricing_audit.createIndex({ updated_at: -1 });


// ─────────────────────────────────────────────
// 10. SHARDING CONFIGURATION
// ─────────────────────────────────────────────
// NOTE: Sharding requires a mongos connection (sharded cluster).
// These commands are for production deployment reference only.
// Uncomment and run via mongos when deploying a sharded cluster.
//
// sh.enableSharding("ardps");
// sh.shardCollection("ardps.flight_instances", { origin_airport_id: 1, departure_datetime: 1 });
// sh.shardCollection("ardps.seat_inventory",   { instance_id: 1 });
// sh.shardCollection("ardps.bookings",         { booking_reference: "hashed" });

print("NOTE: Sharding skipped (standalone mode). Enable via mongos for production cluster.");


// ─────────────────────────────────────────────
// 11. CORE BUSINESS OPERATIONS
// ─────────────────────────────────────────────

// ── 11.1 Search available flights by route and date ──────────────
function searchFlights(originIata, destinationIata, travelDate) {
  const origin = db.airports.findOne({ iata_code: originIata });
  const destination = db.airports.findOne({ iata_code: destinationIata });

  const startOfDay = new Date(travelDate);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(travelDate);
  endOfDay.setHours(23, 59, 59, 999);

  return db.flight_instances.find({
    origin_airport_id: origin._id,
    destination_airport_id: destination._id,
    departure_datetime: { $gte: startOfDay, $lte: endOfDay },
    status: "SCHEDULED"
  }).toArray();
}

// Example: searchFlights("MAA", "DEL", "2026-03-20");


// ── 11.2 Get available seats for a flight instance ────────────────
function getAvailableSeats(instanceId) {
  return db.seat_inventory.find({
    instance_id: instanceId,
    status: "AVAILABLE"
  }).toArray();
}


// ── 11.3 Get dynamic price for a fare class ───────────────────────
function getDynamicPrice(instanceId, fareClass) {
  const instance = db.flight_instances.findOne(
    { _id: instanceId },
    { projection: { pricing_model: 1 } }
  );
  const pricing = instance.pricing_model.find(p => p.fare_class === fareClass);
  if (!pricing) return null;
  return {
    fare_class: fareClass,
    final_price: pricing.base_price * pricing.demand_multiplier,
    base_price: pricing.base_price,
    demand_multiplier: pricing.demand_multiplier,
    occupancy_rate: pricing.occupancy_rate
  };
}


// ── 11.4 Reserve a seat (Optimistic Locking) ──────────────────────
function reserveSeat(instanceId, seatNumber) {
  const holdExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 min hold
  const result = db.seat_inventory.findOneAndUpdate(
    {
      instance_id: instanceId,
      seat_number: seatNumber,
      status: "AVAILABLE"
    },
    {
      $set: {
        status: "RESERVED",
        hold_expiry: holdExpiry
      },
      $inc: { version: 1 }
    },
    { returnDocument: "after" }
  );
  if (!result) {
    return { success: false, message: "Seat not available. Please choose another." };
  }
  return { success: true, seat: result };
}


// ── 11.5 Confirm seat booking (ACID-safe) ─────────────────────────
function confirmSeatBooking(instanceId, seatNumber, currentVersion) {
  const result = db.seat_inventory.findOneAndUpdate(
    {
      instance_id: instanceId,
      seat_number: seatNumber,
      status: "RESERVED",
      version: currentVersion       // Optimistic lock check
    },
    {
      $set: {
        status: "BOOKED",
        hold_expiry: null,
        booked_at: new Date()
      },
      $inc: { version: 1 }
    },
    { returnDocument: "after" }
  );
  if (!result) {
    return { success: false, message: "Booking conflict detected. Please retry." };
  }
  return { success: true, seat: result };
}


// ── 11.6 Create a booking ─────────────────────────────────────────
function createBooking(bookingData) {
  const bookingRef = "PNR" + Math.random().toString(36).substr(2, 9).toUpperCase();
  const booking = {
    booking_reference: bookingRef,
    booking_datetime: new Date(),
    status: "CONFIRMED",
    total_amount: bookingData.totalAmount,
    currency: bookingData.currency || "INR",
    passengers: bookingData.passengers,
    payments: bookingData.payments,
    cancellations: []
  };
  db.bookings.insertOne(booking);
  return { booking_reference: bookingRef, status: "CONFIRMED" };
}


// ── 11.7 Retrieve booking by PNR ──────────────────────────────────
function getBookingByPNR(pnr) {
  return db.bookings.findOne({ booking_reference: pnr });
}


// ── 11.8 Cancel a ticket ──────────────────────────────────────────
function cancelTicket(pnr, ticketNumber, penaltyAmount, refundAmount, reason) {
  // Add cancellation record to booking
  db.bookings.updateOne(
    { booking_reference: pnr, "passengers.ticket.ticket_number": ticketNumber },
    {
      $set: {
        "passengers.$[p].ticket.ticket_status": "CANCELLED",
        status: "CANCELLED"
      },
      $push: {
        cancellations: {
          ticket_number: ticketNumber,
          cancellation_datetime: new Date(),
          penalty_amount: penaltyAmount,
          refund_amount: refundAmount,
          cancellation_reason: reason
        }
      }
    },
    {
      arrayFilters: [{ "p.ticket.ticket_number": ticketNumber }]
    }
  );

  // Free up the seat in inventory
  // (In production, look up instance_id and seat_number from booking first)
  return { success: true, refund_amount: refundAmount };
}


// ── 11.9 Update dynamic pricing after new booking ─────────────────
function updatePricingModel(instanceId, fareClass, newSeatsSold) {
  const instance = db.flight_instances.findOne({ _id: instanceId });
  const pricing = instance.pricing_model.find(p => p.fare_class === fareClass);
  const occupancyRate = newSeatsSold / pricing.seats_total;

  // Dynamic multiplier logic
  let multiplier = 1.0;
  if (occupancyRate >= 0.90) multiplier = 2.50;
  else if (occupancyRate >= 0.75) multiplier = 1.80;
  else if (occupancyRate >= 0.50) multiplier = 1.40;
  else if (occupancyRate >= 0.30) multiplier = 1.20;
  else multiplier = 1.00;

  db.flight_instances.updateOne(
    { _id: instanceId, "pricing_model.fare_class": fareClass },
    {
      $set: {
        "pricing_model.$.seats_sold": newSeatsSold,
        "pricing_model.$.occupancy_rate": occupancyRate,
        "pricing_model.$.demand_multiplier": multiplier,
        "pricing_model.$.last_updated": new Date()
      }
    }
  );

  return { fare_class: fareClass, new_multiplier: multiplier, occupancy_rate: occupancyRate };
}


// ── 11.10 Release expired holds (run as a scheduled job) ──────────
function releaseExpiredHolds() {
  const result = db.seat_inventory.updateMany(
    {
      status: "RESERVED",
      hold_expiry: { $lt: new Date() }
    },
    {
      $set: {
        status: "AVAILABLE",
        hold_expiry: null
      },
      $inc: { version: 1 }
    }
  );
  return { released: result.modifiedCount };
}


// ─────────────────────────────────────────────
// 12. SAMPLE QUERIES
// ─────────────────────────────────────────────

// Q1: Find all active flights between MAA and DEL
db.flight_instances.find({
  origin_airport_id: db.airports.findOne({ iata_code: "MAA" })._id,
  destination_airport_id: db.airports.findOne({ iata_code: "DEL" })._id,
  status: "SCHEDULED"
}).sort({ departure_datetime: 1 });

// Q2: Get all available economy seats for a flight instance
db.seat_inventory.find({
  instance_id: instance1._id,
  status: "AVAILABLE",
  class_type: "ECONOMY"
});

// Q3: Retrieve booking by PNR
db.bookings.findOne({ booking_reference: "PNR12345" });

// Q4: Find all bookings with a specific passenger passport
db.bookings.findOne({ "passengers.passport_number": "A12345678" });

// Q5: Get current dynamic price for economy on a flight
db.flight_instances.findOne(
  { _id: instance1._id },
  { projection: { pricing_model: 1, flight_number: 1 } }
);

// Q6: Get all cancelled bookings
db.bookings.find({ status: "CANCELLED" }).toArray();

// Q7: Count available seats per class on a flight
db.seat_inventory.aggregate([
  { $match: { instance_id: instance1._id, status: "AVAILABLE" } },
  { $group: { _id: "$class_type", available_count: { $sum: 1 } } }
]);

// Q8: Find flights departing in next 24 hours
db.flight_instances.find({
  departure_datetime: {
    $gte: new Date(),
    $lte: new Date(Date.now() + 24 * 60 * 60 * 1000)
  },
  status: "SCHEDULED"
}).sort({ departure_datetime: 1 });

// Q9: Get pricing audit trail for a flight instance
db.pricing_audit.find({ instance_id: instance1._id }).sort({ updated_at: -1 });

// Q10: Find airports near a geolocation (within 50km of Chennai)
db.airports.find({
  location: {
    $near: {
      $geometry: { type: "Point", coordinates: [80.2707, 13.0827] },
      $maxDistance: 50000
    }
  }
});

// ─────────────────────────────────────────────
// END OF ARDPS MONGODB SCHEMA
// ─────────────────────────────────────────────
print("ARDPS MongoDB Schema loaded successfully.");
