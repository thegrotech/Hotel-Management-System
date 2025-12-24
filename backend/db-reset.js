#!/usr/bin/env node

/**
 * Hotel Management System - Database Reset Utility
 * Usage: node db-reset.js [options]
 * 
 * Options:
 *   --all           Reset entire database (all tables)
 *   --bookings      Reset only bookings and transactions
 *   --guests        Reset only guests
 *   --rooms         Reset only rooms
 *   --floors        Reset only floors
 *   --help          Show this help message
 * 
 * Examples:
 *   node db-reset.js --all           # Reset everything
 *   node db-reset.js --bookings      # Clear only bookings and transactions
 *   node db-reset.js --guests        # Clear only guests
 *   node db-reset.js --rooms         # Clear only rooms
 *   node db-reset.js --floors        # Clear only floors
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

// Command line arguments
const args = process.argv.slice(2);
const options = {
    all: args.includes('--all'),
    bookings: args.includes('--bookings'),
    guests: args.includes('--guests'),
    rooms: args.includes('--rooms'),
    floors: args.includes('--floors'),
    help: args.includes('--help')
};

// Show help if requested or no arguments
if (options.help || args.length === 0) {
    showHelp();
    process.exit(0);
}

// Main function
async function resetDatabase() {
    const client = new Client(dbConfig);
    
    try {
        await client.connect();
        console.log('✅ Connected to PostgreSQL database');
        console.log(`📊 Database: ${dbConfig.database}`);
        console.log('=' .repeat(50));
        
        // Check what we're resetting
        if (options.all) {
            console.log('🔄 Resetting ENTIRE DATABASE...');
            await resetAllTables(client);
        } else {
            // Individual resets
            if (options.bookings) {
                console.log('🗑️  Resetting bookings and transactions...');
                await resetBookingsAndTransactions(client);
            }
            if (options.guests) {
                console.log('🗑️  Resetting guests...');
                await resetGuests(client);
            }
            if (options.rooms) {
                console.log('🗑️  Resetting rooms...');
                await resetRooms(client);
            }
            if (options.floors) {
                console.log('🗑️  Resetting floors...');
                await resetFloors(client);
            }
        }
        
        console.log('=' .repeat(50));
        console.log('✅ Database reset completed successfully!');
        
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    } finally {
        await client.end();
        console.log('🔌 Disconnected from database');
    }
}

// Reset all tables
async function resetAllTables(client) {
    console.log('⚠️  WARNING: This will delete ALL data from ALL tables!');
    
    // Ask for confirmation
    if (!await confirmAction('Are you sure you want to reset the entire database?')) {
        console.log('Operation cancelled.');
        return;
    }
    
    // Reset in correct order (respecting foreign key constraints)
    await client.query('DELETE FROM transactions;');
    console.log('   • Deleted all transactions');
    
    await client.query('DELETE FROM bookings;');
    console.log('   • Deleted all bookings');
    
    await client.query('DELETE FROM guests;');
    console.log('   • Deleted all guests');
    
    await client.query('DELETE FROM rooms;');
    console.log('   • Deleted all rooms');
    
    await client.query('DELETE FROM floors;');
    console.log('   • Deleted all floors');
    
    // Keep managers and room_types (these are setup data)
    console.log('   • Preserved managers table (user accounts)');
    console.log('   • Preserved room_types table (room type definitions)');
    
    // Reset sequences
    await resetSequences(client);
}

// Reset bookings and transactions only
async function resetBookingsAndTransactions(client) {
    console.log('⚠️  WARNING: This will delete all bookings and transaction records!');
    
    if (!await confirmAction('Are you sure?')) {
        console.log('Operation cancelled.');
        return;
    }
    
    await client.query('DELETE FROM transactions;');
    console.log('   • Deleted all transactions');
    
    await client.query('DELETE FROM bookings;');
    console.log('   • Deleted all bookings');
    
    // Reset room statuses to 'available'
    await client.query("UPDATE rooms SET status = 'available' WHERE status IN ('booked', 'occupied');");
    console.log('   • Reset all room statuses to "available"');
    
    // Reset booking-related sequences
    await client.query('ALTER SEQUENCE bookings_id_seq RESTART WITH 1;');
    await client.query('ALTER SEQUENCE transactions_id_seq RESTART WITH 1;');
    console.log('   • Reset booking and transaction ID sequences');
}

// Reset guests only
async function resetGuests(client) {
    console.log('⚠️  WARNING: This will delete all guest records!');
    
    if (!await confirmAction('Are you sure?')) {
        console.log('Operation cancelled.');
        return;
    }
    
    // First check if guests have bookings
    const result = await client.query('SELECT COUNT(*) FROM bookings;');
    const bookingCount = parseInt(result.rows[0].count);
    
    if (bookingCount > 0) {
        console.log('❌ Cannot delete guests because there are existing bookings.');
        console.log('   Please delete bookings first or use --bookings option.');
        return;
    }
    
    await client.query('DELETE FROM guests;');
    console.log('   • Deleted all guests');
    
    await client.query('ALTER SEQUENCE guests_id_seq RESTART WITH 1;');
    console.log('   • Reset guest ID sequence');
}

// Reset rooms only
async function resetRooms(client) {
    console.log('⚠️  WARNING: This will delete all room records!');
    
    if (!await confirmAction('Are you sure?')) {
        console.log('Operation cancelled.');
        return;
    }
    
    // First check if rooms have bookings
    const result = await client.query('SELECT COUNT(*) FROM bookings;');
    const bookingCount = parseInt(result.rows[0].count);
    
    if (bookingCount > 0) {
        console.log('❌ Cannot delete rooms because there are existing bookings.');
        console.log('   Please delete bookings first or use --bookings option.');
        return;
    }
    
    await client.query('DELETE FROM rooms;');
    console.log('   • Deleted all rooms');
    
    await client.query('ALTER SEQUENCE rooms_id_seq RESTART WITH 1;');
    console.log('   • Reset room ID sequence');
}

// Reset floors only
async function resetFloors(client) {
    console.log('⚠️  WARNING: This will delete all floor records!');
    
    if (!await confirmAction('Are you sure?')) {
        console.log('Operation cancelled.');
        return;
    }
    
    // First check if floors have rooms
    const result = await client.query('SELECT COUNT(*) FROM rooms;');
    const roomCount = parseInt(result.rows[0].count);
    
    if (roomCount > 0) {
        console.log('❌ Cannot delete floors because there are existing rooms.');
        console.log('   Please delete rooms first or use --rooms option.');
        return;
    }
    
    await client.query('DELETE FROM floors;');
    console.log('   • Deleted all floors');
    
    await client.query('ALTER SEQUENCE floors_id_seq RESTART WITH 1;');
    console.log('   • Reset floor ID sequence');
}

// Reset all sequences
async function resetSequences(client) {
    const sequences = [
        'managers_id_seq',
        'floors_id_seq',
        'room_types_id_seq',
        'rooms_id_seq',
        'guests_id_seq',
        'bookings_id_seq',
        'transactions_id_seq'
    ];
    
    for (const seq of sequences) {
        try {
            await client.query(`ALTER SEQUENCE ${seq} RESTART WITH 1;`);
        } catch (error) {
            // Sequence might not exist yet, that's okay
        }
    }
    console.log('   • Reset all ID sequences');
}

// Confirm action from user
function confirmAction(message) {
    return new Promise((resolve) => {
        const readline = require('readline').createInterface({
            input: process.stdin,
            output: process.stdout
        });
        
        readline.question(`${message} (yes/no): `, (answer) => {
            readline.close();
            resolve(answer.toLowerCase() === 'yes' || answer.toLowerCase() === 'y');
        });
    });
}

// Show help message
function showHelp() {
    console.log(`
Hotel Management System - Database Reset Utility
================================================

Usage: node db-reset.js [options]

Options:
  --all           Reset entire database (all tables)
  --bookings      Reset only bookings and transactions
  --guests        Reset only guests
  --rooms         Reset only rooms
  --floors        Reset only floors
  --help          Show this help message

Examples:
  node db-reset.js --all           # Reset everything
  node db-reset.js --bookings      # Clear only bookings and transactions
  node db-reset.js --guests        # Clear only guests
  node db-reset.js --rooms         # Clear only rooms
  node db-reset.js --floors        # Clear only floors

Important Notes:
  • This utility only deletes data, not table structures
  • Managers and room_types are preserved in all resets
  • Foreign key constraints are respected
  • You will be asked for confirmation before destructive operations
  `);
}

// Run the script
resetDatabase();