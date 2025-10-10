const express = require('express');
const router = express.Router();
const graceai = require('../services/graceai'); // make sure this exists

// --------------------
// Dashboard (EJS page)
// --------------------
router.get('/', async (req, res) => {
  res.render('dashboard', { env: process.env });
});

// --------------------
// Test Chat (EJS page for browser)
// --------------------
router.get('/test', (req, res) => {
  res.render('test-chat', { response: null });
});

router.post('/test', async (req, res) => {
  const question = req.body.question || '';
  try {
    const answer = await graceai.ask({ question, user: { email: "test@example.com" } });
    res.render('test-chat', { response: answer });
  } catch (err) {
    res.render('test-chat', { response: { error: err.message } });
  }
});

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
