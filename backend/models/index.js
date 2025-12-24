const pool = require('../config/database');

// Function to initialize database (run this once)
const initializeDatabase = async () => {
    try {
        console.log('Database structure should be created manually using setup.sql');
        console.log('Run: psql -U postgres -d hotel_management -f backend/models/setup.sql');
        console.log('Or create the database manually with the SQL commands above');
    } catch (error) {
        console.error('Error initializing database:', error);
    }
};

module.exports = {
    pool,
    initializeDatabase
};