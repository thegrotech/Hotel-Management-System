const { Pool } = require('pg');
require('dotenv').config();

// Use DATABASE_URL from Vercel/Neon, or build from individual vars
const connectionString = process.env.DATABASE_URL || 
    `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`;

console.log('Database connection:', process.env.DATABASE_URL ? 'Using DATABASE_URL' : 'Using individual config');

const pool = new Pool({
    connectionString,
    // SSL required for Neon in production
    ssl: process.env.NODE_ENV === 'production' ? { 
        rejectUnauthorized: false 
    } : false,
});

// Test connection
pool.connect((err, client, release) => {
    if (err) {
        console.error('Error connecting to PostgreSQL:', err.message);
        // Don't show full connection string in logs
        if (err.message.includes('password authentication failed')) {
            console.error('Database authentication failed. Check your credentials.');
        }
    } else {
        console.log('✅ Connected to PostgreSQL database');
        release();
    }
});

module.exports = pool;
