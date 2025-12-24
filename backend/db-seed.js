#!/usr/bin/env node

/**
 * Hotel Management System - Database Seeding Utility
 * 
 * This script populates the database with:
 * - 15 floors (1st to 15th floor)
 * - 3 rooms of each type per floor
 * - Total: 15 floors × 15 rooms = 225 rooms
 * - Room numbers: Floor 1: 101-115, Floor 2: 201-215, etc.
 * 
 * Usage: node db-seed.js
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

// Floor data - 15 floors from 1 to 15
const floorsData = [
    { number: 1, name: 'First Floor', description: 'Standard rooms with garden view' },
    { number: 2, name: 'Second Floor', description: 'Standard rooms with city view' },
    { number: 3, name: 'Third Floor', description: 'Premium rooms and business center' },
    { number: 4, name: 'Fourth Floor', description: 'Family rooms and play area' },
    { number: 5, name: 'Fifth Floor', description: 'Executive floor with conference rooms' },
    { number: 6, name: 'Sixth Floor', description: 'Luxury suites floor' },
    { number: 7, name: 'Seventh Floor', description: 'Standard deluxe rooms' },
    { number: 8, name: 'Eighth Floor', description: 'Superior rooms with balcony' },
    { number: 9, name: 'Ninth Floor', description: 'Presidential floor' },
    { number: 10, name: 'Tenth Floor', description: 'Penthouse and premium suites' },
    { number: 11, name: 'Eleventh Floor', description: 'Standard economy rooms' },
    { number: 12, name: 'Twelfth Floor', description: 'Rooms with mountain view' },
    { number: 13, name: 'Thirteenth Floor', description: 'Lucky floor - premium rooms' },
    { number: 14, name: 'Fourteenth Floor', description: 'Top floor with panoramic view' },
    { number: 15, name: 'Fifteenth Floor', description: 'Penthouse sky view suites' }
];

// Room type configurations (price per night)
const roomTypesConfig = {
    'Double Bed': { basePrice: 100.00, description: 'Standard room with one double bed' },
    'Triple Bed': { basePrice: 150.00, description: 'Room with three single beds' },
    'Quad Bed': { basePrice: 200.00, description: 'Room with four single beds' },
    'Quint Bed': { basePrice: 250.00, description: 'Room with five single beds' },
    'Executive Suite': { basePrice: 500.00, description: 'Luxury suite with living area and premium amenities' }
};

// Room descriptions templates
const roomDescriptions = {
    'Double Bed': [
        'Cozy double room with city view',
        'Standard double room with garden view',
        'Deluxe double room with balcony'
    ],
    'Triple Bed': [
        'Family room perfect for small families',
        'Triple sharing room with extra space',
        'Standard triple room with mountain view'
    ],
    'Quad Bed': [
        'Spacious room for group travelers',
        'Family quad room with kids area',
        'Large room with seating area'
    ],
    'Quint Bed': [
        'Extra large room for big groups',
        'Family suite with 5 beds',
        'Budget-friendly group accommodation'
    ],
    'Executive Suite': [
        'Luxury suite with jacuzzi and minibar',
        'Executive suite with workspace and lounge',
        'Premium suite with panoramic city view'
    ]
};

// Get suffix for room number based on room type
function getRoomTypeSuffix(roomType) {
    const suffixes = {
        'Double Bed': 'D',
        'Triple Bed': 'T',
        'Quad Bed': 'Q',
        'Quint Bed': 'F', // Five
        'Executive Suite': 'Ex'
    };
    return suffixes[roomType] || 'X';
}

// Main function
async function seedDatabase() {
    const client = new Client(dbConfig);
    
    try {
        await client.connect();
        console.log('✅ Connected to PostgreSQL database');
        console.log(`📊 Database: ${dbConfig.database}`);
        console.log('='.repeat(60));
        
        // Check if database already has data
        const existingFloors = await client.query('SELECT COUNT(*) FROM floors;');
        const existingRooms = await client.query('SELECT COUNT(*) FROM rooms;');
        
        const floorCount = parseInt(existingFloors.rows[0].count);
        const roomCount = parseInt(existingRooms.rows[0].count);
        
        if (floorCount > 0 || roomCount > 0) {
            console.log('⚠️  WARNING: Database already contains data!');
            console.log(`   Floors: ${floorCount}, Rooms: ${roomCount}`);
            
            if (!await confirmAction('Do you want to clear existing data and reseed?')) {
                console.log('Operation cancelled.');
                return;
            }
            
            // Clear existing data
            console.log('🗑️  Clearing existing data...');
            await clearExistingData(client);
            console.log('✅ Existing data cleared');
        }
        
        console.log('\n🌱 Starting database seeding...');
        
        // Step 1: Get room type IDs
        console.log('📋 Fetching room types...');
        const roomTypeIds = await getRoomTypeIds(client);
        
        // Step 2: Create floors
        console.log('\n🏢 Creating floors...');
        const floorIds = await createFloors(client);
        
        // Step 3: Create rooms
        console.log('\n🚪 Creating rooms...');
        const roomsCreated = await createRooms(client, floorIds, roomTypeIds);
        
        // Step 4: Summary
        console.log('\n' + '='.repeat(60));
        console.log('✅ SEEDING COMPLETED SUCCESSFULLY!');
        console.log('='.repeat(60));
        console.log(`🏢 Floors created: ${floorIds.length}`);
        console.log(`🚪 Rooms created: ${roomsCreated}`);
        console.log(`💰 Total room types: ${Object.keys(roomTypeIds).length}`);
        
        console.log('\n📊 Room Distribution per floor:');
        console.log('   Room Numbers 101-115 for floor 1, 201-215 for floor 2, etc.');
        console.log('   Format: [RoomNumber][TypeSuffix]');
        console.log('\n   Type Suffixes:');
        console.log('   • D = Double Bed');
        console.log('   • T = Triple Bed');
        console.log('   • Q = Quad Bed');
        console.log('   • F = Quint Bed');
        console.log('   • Ex = Executive Suite');
        
        console.log('\n   Per Floor Breakdown:');
        Object.keys(roomTypesConfig).forEach((type, index) => {
            const suffix = getRoomTypeSuffix(type);
            const startRoom = (index * 3) + 1;
            const endRoom = startRoom + 2;
            console.log(`   • ${type} (${suffix}): Rooms ${startRoom}-${endRoom}`);
        });
        
        console.log(`\n💵 Estimated revenue per night (if all rooms booked): $${calculateEstimatedRevenue()}`);
        console.log('='.repeat(60));
        
    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error('Stack:', error.stack);
        process.exit(1);
    } finally {
        await client.end();
        console.log('\n🔌 Disconnected from database');
    }
}

// Get room type IDs from database
async function getRoomTypeIds(client) {
    const result = await client.query('SELECT id, type_name FROM room_types;');
    const roomTypeIds = {};
    
    result.rows.forEach(row => {
        roomTypeIds[row.type_name] = row.id;
    });
    
    // Verify all required room types exist
    const requiredTypes = Object.keys(roomTypesConfig);
    const missingTypes = requiredTypes.filter(type => !roomTypeIds[type]);
    
    if (missingTypes.length > 0) {
        throw new Error(`Missing room types in database: ${missingTypes.join(', ')}. Run setup.sql first.`);
    }
    
    console.log(`   Found ${Object.keys(roomTypeIds).length} room types`);
    return roomTypeIds;
}

// Create floors
async function createFloors(client) {
    const floorIds = [];
    
    for (const floor of floorsData) {
        try {
            const result = await client.query(
                `INSERT INTO floors (floor_number, floor_name, description) 
                 VALUES ($1, $2, $3) 
                 RETURNING id`,
                [floor.number, floor.name, floor.description]
            );
            
            floorIds.push({
                id: result.rows[0].id,
                number: floor.number,
                name: floor.name
            });
            
            console.log(`   ✓ Floor ${floor.number}: ${floor.name}`);
            
        } catch (error) {
            if (error.code === '23505') { // Unique violation
                console.log(`   ⚠️  Floor ${floor.number} already exists, skipping...`);
            } else {
                throw error;
            }
        }
    }
    
    return floorIds;
}

// Create rooms for each floor with proper numbering
async function createRooms(client, floorIds, roomTypeIds) {
    let totalRoomsCreated = 0;
    const roomTypes = Object.keys(roomTypesConfig);
    
    for (const floor of floorIds) {
        console.log(`\n   Floor ${floor.number} (${floor.name}):`);
        
        let floorRoomCount = 0;
        let roomBaseNumber = floor.number * 100; // 100 for floor 1, 200 for floor 2, etc.
        
        // Create 3 rooms of each type per floor
        // Room numbers: 101-115 for floor 1, 201-215 for floor 2, etc.
        for (let typeIndex = 0; typeIndex < roomTypes.length; typeIndex++) {
            const roomType = roomTypes[typeIndex];
            const suffix = getRoomTypeSuffix(roomType);
            
            // Calculate starting room number for this type
            // Each type gets 3 rooms: 
            // Type 0 (Double): rooms 1-3
            // Type 1 (Triple): rooms 4-6
            // Type 2 (Quad): rooms 7-9
            // Type 3 (Quint): rooms 10-12
            // Type 4 (Executive): rooms 13-15
            const startRoomNum = (typeIndex * 3) + 1;
            
            for (let i = 0; i < 3; i++) {
                const roomSequence = startRoomNum + i;
                const roomNumber = `${roomBaseNumber + roomSequence}${suffix}`;
                const price = roomTypesConfig[roomType].basePrice;
                const descriptionIndex = (floor.number + i) % roomDescriptions[roomType].length;
                const description = roomDescriptions[roomType][descriptionIndex];
                
                try {
                    await client.query(
                        `INSERT INTO rooms (room_number, floor_id, room_type_id, price_per_night, description, status) 
                         VALUES ($1, $2, $3, $4, $5, 'available')`,
                        [roomNumber, floor.id, roomTypeIds[roomType], price, description]
                    );
                    
                    floorRoomCount++;
                    totalRoomsCreated++;
                    
                    // Show first few rooms as example
                    if (floor.number <= 2 && typeIndex === 0 && i === 0) {
                        console.log(`      Sample room: ${roomNumber} - ${roomType}`);
                    }
                    
                } catch (error) {
                    if (error.code === '23505') { // Unique violation
                        console.log(`      ⚠️  Room ${roomNumber} already exists, skipping...`);
                    } else {
                        console.log(`      ❌ Error creating room ${roomNumber}: ${error.message}`);
                    }
                }
            }
            
            const endRoomNum = startRoomNum + 2;
            console.log(`      • ${roomType}: Rooms ${roomBaseNumber + startRoomNum}${suffix} to ${roomBaseNumber + endRoomNum}${suffix}`);
        }
        
        console.log(`   ✓ Total rooms on floor ${floor.number}: ${floorRoomCount}`);
    }
    
    return totalRoomsCreated;
}

// Calculate estimated revenue if all rooms are booked
function calculateEstimatedRevenue() {
    const floorsCount = floorsData.length;
    const roomTypesCount = Object.keys(roomTypesConfig).length;
    const roomsPerTypePerFloor = 3;
    
    let totalRevenue = 0;
    
    Object.values(roomTypesConfig).forEach(config => {
        totalRevenue += config.basePrice * roomsPerTypePerFloor * floorsCount;
    });
    
    return totalRevenue.toLocaleString();
}

// Clear existing data (if requested)
async function clearExistingData(client) {
    // Delete in correct order (respecting foreign keys)
    await client.query('DELETE FROM transactions;');
    await client.query('DELETE FROM bookings;');
    await client.query('DELETE FROM guests;');
    await client.query('DELETE FROM rooms;');
    await client.query('DELETE FROM floors;');
    
    // Reset sequences
    await client.query('ALTER SEQUENCE floors_id_seq RESTART WITH 1;');
    await client.query('ALTER SEQUENCE rooms_id_seq RESTART WITH 1;');
    await client.query('ALTER SEQUENCE guests_id_seq RESTART WITH 1;');
    await client.query('ALTER SEQUENCE bookings_id_seq RESTART WITH 1;');
    await client.query('ALTER SEQUENCE transactions_id_seq RESTART WITH 1;');
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
seedDatabase();