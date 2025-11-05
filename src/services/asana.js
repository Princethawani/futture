// src/services/asana.js
const axios = require('axios');

exports.hitEndpoint = async () => {
  try {
    const resp = await axios.post(
      'https://app.asana.com/api/1.0/tasks',
      {}, // empty payload
      {
        headers: { Authorization: `Bearer ${process.env.ASANA_TOKEN}` }
      }
    );
    console.log('Asana endpoint hit successfully');
    return resp.data;
  } catch (err) {
    console.error('Asana hit error:', err.response?.data || err.message);
    return null;
  }
};
