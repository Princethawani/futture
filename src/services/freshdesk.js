const axios = require('axios');

exports.createTicket = async (email) => {
  if (!email) {
    console.error('Email is required to create a Freshdesk ticket');
    return null;
  }

  try {
    const resp = await axios.post(
      'https://ryu.futuremultiverse.com/api/freshdesk/event/create_ticket',
      { email_address: email },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('Freshdesk ticket created successfully for', email);
    return resp.data;
  } catch (err) {
    console.error('Freshdesk hit error:', err.response?.data || err.message);
    return null;
  }
};
