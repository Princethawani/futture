const axios = require('axios');
const BASE = 'https://rest.gohighlevel.com/v1';
const token = process.env.GHL_API_KEY;

exports.createOrUpdateContact = async ({ email, name, phone, sponsor }) => {
  // GHL create contact
  const resp = await axios.post(`${BASE}/contacts/`, {
    email,
    name,
    phone
  }, {
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
  });
  // resp.data should contain id
  return resp.data;
};

exports.createAppointment = async ({ contactId, startTime, endTime, notes }) => {
  const resp = await axios.post(`${BASE}/appointments/`, {
    contactId,
    startTime,
    endTime,
    notes
  }, {
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
  });
  return resp.data;
};

exports.updateContactSponsor = async (contactId, sponsor) => {
  // Implementation depends on your custom fields config in GHL
  // As placeholder, we do an update call (adapt to real customField keys)
  return axios.put(`${BASE}/contacts/${contactId}`, {
    customField: {
      sponsor_name: sponsor.name,
      sponsor_email: sponsor.email
    }
  }, {
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
  });
};
