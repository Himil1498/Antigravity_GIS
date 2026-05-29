require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const { rawPool } = require('../src/config/database');

(async () => {
  const client = await rawPool.connect();
  try {
    await client.query('BEGIN');

    const missingCustomers = [
      'Dark Fiber',
      'JTM Internet',
      'Optimal Telemedia',
      'PGCIL',
      'Railtel',
      'RCOM',
      'TTSL'
    ];

    const INDIAN_STATES = [
      'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
      'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
      'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
      'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
      'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
      'Andaman and Nicobar Islands', 'Chandigarh', 'Dadra and Nagar Haveli and Daman and Diu',
      'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Lakshadweep', 'Puducherry'
    ];

    for (const cust of missingCustomers) {
      const res = await client.query(
        `INSERT INTO dark_fiber_folders (name, parent_id) VALUES ($1, NULL) RETURNING id`,
        [cust]
      );
      const parentId = res.rows[0].id;
      
      for (const state of INDIAN_STATES) {
        await client.query(
          `INSERT INTO dark_fiber_folders (name, parent_id) VALUES ($1, $2)`,
          [state, parentId]
        );
      }
    }

    await client.query('COMMIT');
    console.log('Successfully seeded missing customers and their regions into dark_fiber_folders.');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error:', err);
  } finally {
    client.release();
    process.exit(0);
  }
})();
