const express = require('express');
const router = express.Router();
const graceai = require('../services/graceai'); // make sure this exists


// --------------------
// Test Chat API 
// --------------------
router.post('/api/test', async (req, res) => {
  const question = req.body.question || '';
  try {
    const answer = await graceai.ask({ question, user: { email: "test@example.com" } });
    res.json({ ok: true, question, answer });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

module.exports = router;