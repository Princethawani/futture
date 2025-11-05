const axios = require('axios');

exports.ask = async ({ question, user }) => {
  try {
    const url = process.env.GRACEAI_API_URL;
    const apiKey = process.env.GRACEAI_API_KEY;

    const response = await axios.post(url, {
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are GraceAI, a helpful assistant." },
        { role: "user", content: question }
      ]
      }, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
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
