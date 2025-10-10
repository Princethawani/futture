const axios = require('axios');
const btoa = (s) => Buffer.from(s).toString('base64');

exports.createTicket = async ({ email, subject, description }) => {
  const domain = process.env.FRESHDESK_DOMAIN;
  const apiKey = process.env.FRESHDESK_API_KEY;
  const url = `https://${domain}.freshdesk.com/api/v2/tickets`;
  const auth = `Basic ${btoa(apiKey + ':X')}`;

  return axios.post(url, {
    email,
    subject,
    description,
    status: 2,
    priority: 1
  }, {
    headers: { Authorization: auth, 'Content-Type': 'application/json' }
  });
};
