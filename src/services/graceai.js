const axios = require('axios');

exports.ask = async ({ question, user }) => {
  try {
    const url = process.env.GRACEAI_API_URL;
    const apiKey = process.env.GRACEAI_API_KEY;

    const response = await axios.post(url, { question, user }, {
      headers: { 'Authorization': `Bearer ${apiKey}` },
      timeout: 5000
    });

    return response.data;
  } catch (err) {
    // error for API clients
    if (err.code === 'ENOTFOUND') {
      // return { error: `Could not reach GraceAI API check your envornmental variables` };    
      console.error('Network error: Could not reach GraceAI API. Check your environmental variables.');
    }
    throw err;
  }
};
