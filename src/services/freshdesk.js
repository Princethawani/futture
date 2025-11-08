// src/services/freshdesk.js
const axios = require('axios');

exports.hitEndpoint = async () => {
  try {
    const resp = await axios.post(
      'https://yourcompany.freshdesk.com/api/v2/tickets', 
      {}, // empty payload
      {
        auth: { username: process.env.FRESHDESK_API_KEY, password: 'X' }
      }
    );
    console.log('Frshdesk Ticket has been created successfully');
    return resp.data;
  } catch (err) {
    console.error('Freshdesk hit error:', err.response?.data || err.message);
    return null;
  }
};
