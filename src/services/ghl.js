// src/services/ghl.js
const pool = require('../db');

exports.createOrUpdateContact = async ({ email, name, phone, sponsor }) => {
  try {
    const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return { id: existing[0].id, email, name, phone };
    }

    const [result] = await pool.query(
      'INSERT INTO users (name, email, phone, company) VALUES (?, ?, ?, ?)',
      [name, email, phone || null, sponsor?.company || null]
    );

    return {
      id: result.insertId,
      name,
      email,
      phone,
      company: sponsor?.company || null
    };

  } catch (err) {
    console.error('DB Error in createOrUpdateContact:', err.message);
    throw err;
  }
};
