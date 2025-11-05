const axios = require('axios');
const base = process.env.TIDIO_API_BASE || 'https://api.tidkio.com';
const token = process.env.TIDIO_API_KEY;

exports.sendMessage = async (conversationId, text) => {
  if (!conversationId) throw new Error('conversationId required');

  const url = `${base}/api/conversations/${conversationId}/messages`;

  const body = {
    message: {
      type: 'text',
      text,
    },
  };

  try {
    const response = await axios.post(url, body, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    console.log('Message sent to Tidio:', response.data);
    return response.data;
  } catch (error) {
    console.error('Failed to send message to Tidio:', error.response?.data || error.message);
    throw error;
  }
};
