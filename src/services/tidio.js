const axios = require('axios');
const base = process.env.TIDIO_API_BASE || 'https://api.tidio.co';
const token = process.env.TIDIO_API_KEY;

exports.sendMessage = async (conversationId, text) => {
  if (!conversationId) throw new Error('conversationId required');
  const url = `${base}/api/conversations/${conversationId}/messages`;
  // Tidio message body shape may differ — adapt as needed
  return axios.post(url, { type: 'message', text }, {
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
  });
};
