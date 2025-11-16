const express = require('express');
const router = express.Router();
const graceai = require('../services/graceai'); // make sure this exists

// --------------------
// Test Chat API 
// --------------------
router.post('/api/test', async (req, res) => {
  const question = req.body.question || '';

  try {
    // Call GraceAI
    const response = await graceai.ask({
      question,
      user: { email: "test@example.com" } // adjust as needed
    });

    // Extract the actual text from the Chat Completion response
    let reply = '';

    if (response?.choices?.[0]?.message?.content) {
      // Chat completion format
      reply = response.choices[0].message.content;
    } else if (typeof response === 'string') {
      // Already a string
      reply = response;
    } else if (typeof response === 'object' && response !== null) {
      // Fallback: pick common fields or stringify
      reply = response.reply || response.text || JSON.stringify(response);
    } else {
      reply = String(response);
    }

    res.json({ reply });
  } catch (err) {
    console.error('GraceAI error:', err.message || err);

    // Friendly fallback message
    res.status(500).json({
      reply: 'Unable to reach the chat server. Please try again later.'
    });
  }
});

module.exports = router;
