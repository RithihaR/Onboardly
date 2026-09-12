require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

pool.query('SELECT NOW()')
  .then((res) => {
    console.log('DB CONNECTION OK:', res.rows);
    pool.end();
  })
  .catch((err) => {
    console.error('DB ERROR:', err.message);
    pool.end();
  });