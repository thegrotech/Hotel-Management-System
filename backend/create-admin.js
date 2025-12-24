const bcrypt = require('bcryptjs');
const pool = require('./config/database');

async function createAdminUser() {
    try {
        const username = 'admin';
        const password = 'admin123';
        const fullName = 'Hotel Manager';
        const email = 'manager@hotel.com';
        
        // Hash the password
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);
        
        // Insert or update admin user
        const query = `
            INSERT INTO managers (username, password_hash, full_name, email) 
            VALUES ($1, $2, $3, $4)
            ON CONFLICT (username) 
            DO UPDATE SET 
                password_hash = EXCLUDED.password_hash,
                full_name = EXCLUDED.full_name,
                email = EXCLUDED.email
            RETURNING *;
        `;
        
        const result = await pool.query(query, [username, passwordHash, fullName, email]);
        
        console.log('✅ Admin user created/updated successfully!');
        console.log('Username:', username);
        console.log('Password:', password);
        console.log('Hashed password stored:', passwordHash.substring(0, 30) + '...');
        
    } catch (error) {
        console.error('Error creating admin user:', error);
    } finally {
        process.exit();
    }
}

createAdminUser();
