#!/usr/bin/env node

/**
 * Hotel Management System - Bookings Seeding Utility
 * 
 * This script populates the database with realistic booking data for:
 * - Makkah/Madina hotels for pilgrims (January 2026 - March 2026)
 * - 100% Muslim guests (70% Pakistani, 30% International Muslims)
 * - 80% room occupancy, 20% rooms kept available
 * - Stay duration: 4-14 nights
 * - Currency: SAR (Saudi Riyals)
 * - Breakfast charges: 20 SAR per person per day
 * 
 * Usage: node bookings-seed.js
 */

const { Client } = require('pg');
require('dotenv').config();

// Database configuration
const dbConfig = {
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'hotel_management',
    password: process.env.DB_PASSWORD || '',
    port: process.env.DB_PORT || 5432,
};

// Date range: January 1, 2026 to March 31, 2026
const START_DATE = new Date('2026-01-01');
const END_DATE = new Date('2026-03-31');
const TOTAL_DAYS = Math.floor((END_DATE - START_DATE) / (1000 * 60 * 60 * 24));

// Payment method distribution
const PAYMENT_METHODS = [
    { method: 'credit_card', percentage: 50 },
    { method: 'debit_card', percentage: 20 },
    { method: 'cash', percentage: 20 },
    { method: 'online', percentage: 10 }
];

// Muslim first names (male and female)
const MUSLIM_FIRST_NAMES = {
    pakistani_male: [
        'Muhammad', 'Ali', 'Ahmed', 'Hassan', 'Hussain', 'Usman', 'Omar', 'Abdullah', 
        'Ibrahim', 'Yusuf', 'Zain', 'Hamza', 'Bilal', 'Farhan', 'Khalid', 'Nasir',
        'Rashid', 'Tariq', 'Waseem', 'Zahid', 'Arif', 'Faisal', 'Javed', 'Kamran'
    ],
    pakistani_female: [
        'Aisha', 'Fatima', 'Zainab', 'Maryam', 'Khadija', 'Safia', 'Hafsa', 'Sumayya',
        'Amina', 'Sara', 'Zara', 'Hina', 'Nadia', 'Samina', 'Rabia', 'Sana',
        'Tahira', 'Yasmin', 'Noreen', 'Farah', 'Ghazala', 'Humaira', 'Iram', 'Javeria'
    ],
    international_male: [
        'Abdul', 'Mohammed', 'Omar', 'Khalid', 'Salim', 'Rashid', 'Mahmoud', 'Hassan',
        'Ibrahim', 'Yousef', 'Ahmed', 'Mustafa', 'Tariq', 'Jamal', 'Samir', 'Karim',
        'Aziz', 'Faruq', 'Idris', 'Malik', 'Nasir', 'Qasim', 'Rahim', 'Saeed'
    ],
    international_female: [
        'Aisha', 'Fatima', 'Mariam', 'Khadija', 'Zahra', 'Layla', 'Nour', 'Salma',
        'Amira', 'Dalia', 'Hana', 'Jamilah', 'Leila', 'Nadia', 'Rania', 'Soraya',
        'Yasmin', 'Zahra', 'Halima', 'Intisar', 'Kawthar', 'Munira', 'Najwa', 'Rasha'
    ]
};

// Last names
const LAST_NAMES = {
    pakistani: [
        'Khan', 'Ahmed', 'Ali', 'Hussain', 'Malik', 'Qureshi', 'Shah', 'Baig',
        'Chaudhry', 'Sheikh', 'Mirza', 'Raza', 'Abbasi', 'Khalid', 'Nawaz', 'Yousuf',
        'Zafar', 'Butt', 'Afridi', 'Khattak', 'Mughal', 'Siddiqui', 'Hashmi', 'Javed'
    ],
    international: [
        'Al-Saud', 'Al-Farsi', 'Al-Ghamdi', 'Al-Harbi', 'Al-Otaibi', 'Al-Zahrani',
        'Al-Mutairi', 'Al-Shammari', 'Al-Qahtani', 'Al-Anazi', 'Al-Harthi', 'Al-Balawi',
        'Al-Johani', 'Al-Malki', 'Al-Rashidi', 'Al-Shehri', 'Al-Thaqafi', 'Al-Yami',
        'Al-Hakim', 'Al-Khateeb', 'Al-Masri', 'Al-Turk', 'Al-Yemeni', 'Al-Somali'
    ]
};

// International Muslim countries (for address)
const MUSLIM_COUNTRIES = [
    'Saudi Arabia', 'United Arab Emirates', 'Qatar', 'Kuwait', 'Oman', 'Bahrain',
    'Egypt', 'Jordan', 'Turkey', 'Indonesia', 'Malaysia', 'Bangladesh',
    'Morocco', 'Algeria', 'Tunisia', 'Sudan', 'Somalia', 'Yemen'
];

// Pakistani cities
const PAKISTANI_CITIES = [
    'Karachi', 'Lahore', 'Islamabad', 'Rawalpindi', 'Faisalabad', 'Multan',
    'Peshawar', 'Quetta', 'Sialkot', 'Gujranwala', 'Hyderabad', 'Sukkur'
];

// ID types
const ID_TYPES = ['Passport', 'National ID', 'Iqama', 'Driver License'];

// Special requests for pilgrims
const SPECIAL_REQUESTS = [
    'Please provide prayer mat',
    'Need Quran in room',
    'Halal food only',
    'Request for early breakfast for Fajr',
    'Near mosque location preferred',
    'Need prayer time notification',
    'Request for Zamzam water',
    'Quiet room for worship',
    'Need transportation to Haram',
    'Request for Islamic channels on TV'
];

// Breakfast charge per person per day (SAR)
const BREAKFAST_RATE = 20;

// Main function
async function seedBookings() {
    const client = new Client(dbConfig);
    
    try {
        await client.connect();
        console.log('✅ Connected to PostgreSQL database');
        console.log(`📊 Database: ${dbConfig.database}`);
        console.log('='.repeat(80));
        console.log('🌙 HOTEL MANAGEMENT SYSTEM - PILGRIM BOOKINGS SEEDING');
        console.log('='.repeat(80));
        console.log(`📍 Location: Makkah/Madina Hotels`);
        console.log(`📅 Period: ${START_DATE.toISOString().split('T')[0]} to ${END_DATE.toISOString().split('T')[0]}`);
        console.log(`💰 Currency: SAR (Saudi Riyals)`);
        console.log('👥 Guests: 100% Muslim (70% Pakistani, 30% International)');
        console.log('='.repeat(80));
        
        // Check existing data
        const existingBookings = await client.query('SELECT COUNT(*) FROM bookings;');
        const existingGuests = await client.query('SELECT COUNT(*) FROM guests;');
        
        const bookingCount = parseInt(existingBookings.rows[0].count);
        const guestCount = parseInt(existingGuests.rows[0].count);
        
        if (bookingCount > 0 || guestCount > 0) {
            console.log('⚠️  WARNING: Database already contains booking data!');
            console.log(`   Guests: ${guestCount}, Bookings: ${bookingCount}`);
            
            if (!await confirmAction('Do you want to clear existing booking data and reseed?')) {
                console.log('Operation cancelled.');
                return;
            }
            
            // Clear existing booking data
            console.log('🗑️  Clearing existing booking data...');
            await clearExistingBookingData(client);
            console.log('✅ Existing booking data cleared');
        }
        
        // Get all rooms with their types and capacities
        console.log('\n📋 Fetching rooms and room types...');
        const rooms = await getRoomsWithCapacity(client);
        
        if (rooms.length === 0) {
            throw new Error('No rooms found in database. Please run room seeding first!');
        }
        
        console.log(`   Found ${rooms.length} rooms`);
        
        // Calculate target bookings (80% occupancy)
        const targetBookings = Math.floor(rooms.length * 0.8);
        console.log(`\n🎯 Target: ${targetBookings} bookings (80% of ${rooms.length} rooms)`);
        
        // Step 1: Generate Muslim guests
        console.log('\n👥 Generating Muslim guest profiles...');
        const guests = await generateGuests(client, 150); // Generate 150 guests
        
        // Step 2: Create bookings for the 90-day period
        console.log('\n📅 Creating pilgrim bookings (Jan 2026 - Mar 2026)...');
        const bookingsCreated = await createPilgrimBookings(client, rooms, guests, targetBookings);
        
        // Step 3: Summary
        console.log('\n' + '='.repeat(80));
        console.log('✅ PILGRIM BOOKINGS SEEDING COMPLETED SUCCESSFULLY!');
        console.log('='.repeat(80));
        console.log(`👥 Guests created: ${guests.length}`);
        console.log(`📅 Bookings created: ${bookingsCreated.total}`);
        console.log(`💰 Total revenue (if all paid): ${bookingsCreated.totalRevenue.toLocaleString()} SAR`);
        console.log(`🍽️  Breakfast charges added: ${bookingsCreated.breakfastBookings} bookings`);
        console.log('\n📊 Booking Distribution:');
        console.log(`   • Confirmed: ${bookingsCreated.status.confirmed}`);
        console.log(`   • Checked-in: ${bookingsCreated.status.checked_in}`);
        console.log(`   • Checked-out: ${bookingsCreated.status.checked_out}`);
        console.log('\n💳 Payment Methods:');
        console.log(`   • Credit Card: ${bookingsCreated.payments.credit_card}`);
        console.log(`   • Debit Card: ${bookingsCreated.payments.debit_card}`);
        console.log(`   • Cash: ${bookingsCreated.payments.cash}`);
        console.log(`   • Online: ${bookingsCreated.payments.online}`);
        console.log('\n🕌 Guest Nationalities:');
        console.log(`   • Pakistani: ${guests.filter(g => g.nationality === 'pakistani').length}`);
        console.log(`   • International: ${guests.filter(g => g.nationality === 'international').length}`);
        console.log('='.repeat(80));
        console.log('\n📈 Occupancy Rate:');
        const occupancyRate = (bookingsCreated.total / rooms.length * 100).toFixed(1);
        console.log(`   ${occupancyRate}% of rooms have bookings (Target: 80%)`);
        console.log(`   ${(100 - parseFloat(occupancyRate)).toFixed(1)}% of rooms available for walk-ins`);
        console.log('='.repeat(80));
        
    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error('Stack:', error.stack);
        process.exit(1);
    } finally {
        await client.end();
        console.log('\n🔌 Disconnected from database');
    }
}

// Get all rooms with their capacity info
async function getRoomsWithCapacity(client) {
    const result = await client.query(`
        SELECT r.id, r.room_number, r.floor_id, r.room_type_id, r.status, r.price_per_night,
               rt.type_name, rt.max_occupancy
        FROM rooms r
        LEFT JOIN room_types rt ON r.room_type_id = rt.id
        ORDER BY r.id
    `);
    
    return result.rows;
}

// Generate Muslim guest profiles
async function generateGuests(client, count) {
    const guests = [];
    const createdGuests = [];
    
    // Generate guest data
    for (let i = 0; i < count; i++) {
        const isPakistani = Math.random() < 0.7; // 70% Pakistani
        const isMale = Math.random() < 0.6; // 60% male, 40% female
        
        let firstName, lastName, nationality;
        
        if (isPakistani) {
            nationality = 'pakistani';
            firstName = isMale ? 
                MUSLIM_FIRST_NAMES.pakistani_male[Math.floor(Math.random() * MUSLIM_FIRST_NAMES.pakistani_male.length)] :
                MUSLIM_FIRST_NAMES.pakistani_female[Math.floor(Math.random() * MUSLIM_FIRST_NAMES.pakistani_female.length)];
            lastName = LAST_NAMES.pakistani[Math.floor(Math.random() * LAST_NAMES.pakistani.length)];
        } else {
            nationality = 'international';
            firstName = isMale ?
                MUSLIM_FIRST_NAMES.international_male[Math.floor(Math.random() * MUSLIM_FIRST_NAMES.international_male.length)] :
                MUSLIM_FIRST_NAMES.international_female[Math.floor(Math.random() * MUSLIM_FIRST_NAMES.international_female.length)];
            lastName = LAST_NAMES.international[Math.floor(Math.random() * LAST_NAMES.international.length)];
        }
        
        // Generate Pakistani phone number or international
        let phone;
        if (isPakistani) {
            phone = `+92-3${Math.floor(Math.random() * 90 + 10)}-${Math.floor(Math.random() * 9000000 + 1000000)}`;
        } else {
            phone = `+966-5${Math.floor(Math.random() * 90 + 10)}-${Math.floor(Math.random() * 1000000 + 100000)}`;
        }
        
        const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com`;
        
        let address, country;
        if (isPakistani) {
            const city = PAKISTANI_CITIES[Math.floor(Math.random() * PAKISTANI_CITIES.length)];
            address = `Street ${Math.floor(Math.random() * 100) + 1}, ${city}, Pakistan`;
            country = 'Pakistan';
        } else {
            country = MUSLIM_COUNTRIES[Math.floor(Math.random() * MUSLIM_COUNTRIES.length)];
            address = `District ${Math.floor(Math.random() * 20) + 1}, ${country}`;
        }
        
        const governmentId = `${isPakistani ? 'PK' : 'INT'}-${Math.floor(Math.random() * 10000000) + 1000000}`;
        const idType = ID_TYPES[Math.floor(Math.random() * ID_TYPES.length)];
        
        guests.push({
            firstName,
            lastName,
            email,
            phone,
            address,
            governmentId,
            idType,
            nationality
        });
    }
    
    // Insert guests into database
    for (const guest of guests) {
        try {
            const result = await client.query(
                `INSERT INTO guests 
                 (first_name, last_name, email, phone, address, government_id, id_type) 
                 VALUES ($1, $2, $3, $4, $5, $6, $7) 
                 RETURNING id`,
                [guest.firstName, guest.lastName, guest.email, guest.phone, 
                 guest.address, guest.governmentId, guest.idType]
            );
            
            createdGuests.push({
                id: result.rows[0].id,
                ...guest
            });
            
        } catch (error) {
            if (error.code === '23505') { // Unique violation (phone/email)
                // Generate new phone and retry
                guest.phone = `+966-5${Math.floor(Math.random() * 90 + 10)}-${Math.floor(Math.random() * 1000000 + 100000)}`;
                
                const retryResult = await client.query(
                    `INSERT INTO guests 
                     (first_name, last_name, email, phone, address, government_id, id_type) 
                     VALUES ($1, $2, $3, $4, $5, $6, $7) 
                     RETURNING id`,
                    [guest.firstName, guest.lastName, guest.email, guest.phone, 
                     guest.address, guest.governmentId, guest.idType]
                );
                
                createdGuests.push({
                    id: retryResult.rows[0].id,
                    ...guest
                });
            } else {
                console.error(`Error creating guest ${guest.firstName} ${guest.lastName}:`, error.message);
            }
        }
    }
    
    console.log(`   Created ${createdGuests.length} Muslim guests`);
    return createdGuests;
}

// Create pilgrim bookings with proper date ranges
async function createPilgrimBookings(client, rooms, guests, targetBookings) {
    const bookingsCreated = {
        total: 0,
        totalRevenue: 0,
        breakfastBookings: 0,
        status: { confirmed: 0, checked_in: 0, checked_out: 0 },
        payments: { credit_card: 0, debit_card: 0, cash: 0, online: 0 }
    };
    
    // Track room bookings to avoid conflicts
    const roomBookings = new Map(); // room_id -> array of booking date ranges
    
    // Initialize room bookings map
    rooms.forEach(room => {
        roomBookings.set(room.id, []);
    });
    
    let attempts = 0;
    const maxAttempts = targetBookings * 3; // Safety limit
    
    while (bookingsCreated.total < targetBookings && attempts < maxAttempts) {
        attempts++;
        
        // Select random room
        const room = rooms[Math.floor(Math.random() * rooms.length)];
        
        // Skip if room is marked for maintenance (5% chance to keep some rooms in maintenance)
        if (room.status === 'maintenance' && Math.random() < 0.95) {
            continue;
        }
        
        // Generate stay duration (4-14 nights)
        const stayNights = Math.floor(Math.random() * 11) + 4; // 4 to 14 nights
        
        // Generate random check-in date within range
        const maxCheckInDay = TOTAL_DAYS - stayNights;
        if (maxCheckInDay <= 0) continue;
        
        const checkInDay = Math.floor(Math.random() * maxCheckInDay);
        const checkInDate = new Date(START_DATE);
        checkInDate.setDate(START_DATE.getDate() + checkInDay);
        
        const checkOutDate = new Date(checkInDate);
        checkOutDate.setDate(checkInDate.getDate() + stayNights);
        
        // Check for date conflicts
        const existingBookings = roomBookings.get(room.id);
        const hasConflict = existingBookings.some(booking => {
            return (checkInDate < booking.checkOut && checkOutDate > booking.checkIn);
        });
        
        if (hasConflict) {
            continue; // Try another room/date
        }
        
        // Select random guest
        const guest = guests[Math.floor(Math.random() * guests.length)];
        
        // Determine number of guests (respect room capacity)
        const maxGuests = room.max_occupancy;
        const numberOfGuests = Math.floor(Math.random() * (maxGuests - 1)) + 1; // At least 1 guest
        
        // Calculate total amount
        const roomAmount = room.price_per_night * stayNights;
        
        // Determine if breakfast is included (30% chance)
        const includeBreakfast = Math.random() < 0.3;
        const breakfastAmount = includeBreakfast ? (BREAKFAST_RATE * numberOfGuests * stayNights) : 0;
        
        const totalAmount = roomAmount + breakfastAmount;
        
        // Determine booking status based on dates
        const today = new Date();
        let status;
        if (checkOutDate < today) {
            status = 'checked_out'; // Past booking
        } else if (checkInDate <= today && checkOutDate >= today) {
            status = 'checked_in'; // Current booking
        } else {
            status = 'confirmed'; // Future booking
        }
        
        // Select payment method based on distribution
        const rand = Math.random() * 100;
        let paymentMethod;
        if (rand < 50) {
            paymentMethod = 'credit_card';
            bookingsCreated.payments.credit_card++;
        } else if (rand < 70) {
            paymentMethod = 'debit_card';
            bookingsCreated.payments.debit_card++;
        } else if (rand < 90) {
            paymentMethod = 'cash';
            bookingsCreated.payments.cash++;
        } else {
            paymentMethod = 'online';
            bookingsCreated.payments.online++;
        }
        
        // Special request (40% chance)
        const specialRequest = Math.random() < 0.4 ? 
            SPECIAL_REQUESTS[Math.floor(Math.random() * SPECIAL_REQUESTS.length)] : null;
        
        try {
            // Start transaction
            await client.query('BEGIN');
            
            // Create booking
            const bookingResult = await client.query(
                `INSERT INTO bookings 
                 (guest_id, room_id, check_in_date, check_out_date, 
                  number_of_guests, total_amount, status, special_requests)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                 RETURNING id, check_in_date, check_out_date`,
                [guest.id, room.id, 
                 checkInDate.toISOString().split('T')[0],
                 checkOutDate.toISOString().split('T')[0],
                 numberOfGuests, totalAmount, status, specialRequest]
            );
            
            // Update room status based on booking status
            let roomStatus;
            switch(status) {
                case 'confirmed':
                    roomStatus = 'booked';
                    bookingsCreated.status.confirmed++;
                    break;
                case 'checked_in':
                    roomStatus = 'occupied';
                    bookingsCreated.status.checked_in++;
                    break;
                case 'checked_out':
                    roomStatus = 'available';
                    bookingsCreated.status.checked_out++;
                    break;
                default:
                    roomStatus = 'booked';
            }
            
            await client.query(
                'UPDATE rooms SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
                [roomStatus, room.id]
            );
            
            // Create booking transaction
            await client.query(
                `INSERT INTO transactions 
                 (booking_id, transaction_type, amount, payment_method, payment_status)
                 VALUES ($1, $2, $3, $4, $5)`,
                [bookingResult.rows[0].id, 'booking', roomAmount, paymentMethod, 'completed']
            );
            
            // Create breakfast transaction if included
            if (includeBreakfast && breakfastAmount > 0) {
                await client.query(
                    `INSERT INTO transactions 
                     (booking_id, transaction_type, amount, payment_method, payment_status, notes)
                     VALUES ($1, $2, $3, $4, $5, $6)`,
                    [bookingResult.rows[0].id, 'additional_charge', breakfastAmount, 
                     paymentMethod, 'completed', `Breakfast for ${numberOfGuests} guests x ${stayNights} days`]
                );
                bookingsCreated.breakfastBookings++;
            }
            
            await client.query('COMMIT');
            
            // Track this booking for the room
            roomBookings.get(room.id).push({
                checkIn: checkInDate,
                checkOut: checkOutDate
            });
            
            bookingsCreated.total++;
            bookingsCreated.totalRevenue += totalAmount;
            
            // Show progress
            if (bookingsCreated.total % 20 === 0) {
                console.log(`   Created ${bookingsCreated.total} bookings...`);
            }
            
        } catch (error) {
            await client.query('ROLLBACK');
            if (error.code !== '23505') { // Skip unique constraint errors
                console.error(`Error creating booking:`, error.message);
            }
        }
    }
    
    // Mark some rooms as maintenance (5%)
    const maintenanceRooms = Math.floor(rooms.length * 0.05);
    for (let i = 0; i < maintenanceRooms; i++) {
        const room = rooms[Math.floor(Math.random() * rooms.length)];
        // Only mark as maintenance if room has no bookings
        if (roomBookings.get(room.id).length === 0) {
            await client.query(
                'UPDATE rooms SET status = $1 WHERE id = $2',
                ['maintenance', room.id]
            );
        }
    }
    
    console.log(`\n   Finished creating ${bookingsCreated.total} pilgrim bookings`);
    console.log(`   Total attempts: ${attempts}`);
    
    return bookingsCreated;
}

// Clear existing booking data
async function clearExistingBookingData(client) {
    await client.query('DELETE FROM transactions;');
    await client.query('DELETE FROM bookings;');
    await client.query('DELETE FROM guests;');
    
    // Reset sequences
    await client.query('ALTER SEQUENCE guests_id_seq RESTART WITH 1;');
    await client.query('ALTER SEQUENCE bookings_id_seq RESTART WITH 1;');
    await client.query('ALTER SEQUENCE transactions_id_seq RESTART WITH 1;');
    
    // Reset all rooms to available
    await client.query('UPDATE rooms SET status = $1', ['available']);
}

// Confirm action from user
function confirmAction(message) {
    return new Promise((resolve) => {
        const readline = require('readline').createInterface({
            input: process.stdin,
            output: process.stdout
        });
        
        readline.question(`\n${message} (yes/no): `, (answer) => {
            readline.close();
            resolve(answer.toLowerCase() === 'yes' || answer.toLowerCase() === 'y');
        });
    });
}

// Run the script
seedBookings();