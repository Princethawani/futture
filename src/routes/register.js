// routes/register.js
const express = require('express')
const router = express.Router()
const axios = require('axios')
const freshdesk = require('../services/freshdesk')
const asana = require('../services/asana')

router.post('/', async (req, res) => {
   try {
    const { name, email, company_name, platform, referrer } = req.body;

    if (!name || !email) return res.status(400).json({ success: false, message: 'Name and email required' });
    if (!platform) return res.status(400).json({ success: false, message: 'Platform required' });

    // --- Call GHL Registration API with validateStatus ---
    const ghlResponse = await axios.post(
      'https://ryu.futuremultiverse.com/api/ghl-register',
      { name, email, company_name, platform, referrer },
      {
        validateStatus: () => true // accept all HTTP status codes
      }
    );

    const ghldata = ghlResponse.data;

    // --- Handle duplicate email ---
    if (ghldata.status === 0 && ghldata.msg === "ghl_duplicate_email") {
      console.log("Duplicate email — returning success with duplicate flag");
      return res.status(200).json({
        success: true,
        message: 'Email already exists — continuing session',
        duplicate: true,
        user: { name, email, company_name: company_name || '', platform, referrer: referrer || '' },
        token: Buffer.from(email).toString('base64')
      });
    }

    // --- Handle successful registration ---
    const ghlUser = ghldata.data?.[0] || { name, email, company_name, platform, referrer };
    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      user: {
        name: ghlUser.name,
        email: ghlUser.email,
        company_name: ghlUser.company_name || '',
        platform: ghlUser.platform,
        referrer: ghlUser.referrer || '',
        ghl_contact_id: ghlUser.ghl_contact_id || null
      },
      token: Buffer.from(email).toString('base64')
    });
    
    // --- Background tasks (no need to block frontend) ---
    freshdesk.createTicket(email).catch(err =>
      console.error('Freshdesk ticket error:', err)
    );

    asana.hitEndpoint().catch(err =>
      console.error('Asana task error:', err)
    );

  } catch (err) {
    console.error('Registration error:', err.toJSON ? err.toJSON() : err);

    res.status(500).json({
      success: false,
      message: 'Failed to register user',
      error: err.response?.data || err.message
    });
  }
});

module.exports = router;
