// // src/routes/register.js

// const express = require('express');
// const router = express.Router();
// const axios = require('axios');

// router.post('/', async (req, res) => {
//   try {
//     const { name, email, company } = req.body;

//     if (!name || !email) {
//       return res.status(400).json({ success: false, message: 'Name and email are required' });
//     }

//     // Send only the fields needed
//     const ghlResponse = await axios.post('https://ryu.futuremultiverse.com/api/ghl-register', { name, email, company });

//     const ghlUser = ghlResponse.data.ghlUser || ghlResponse.data.user || { name, email, company };

//     return res.status(201).json({
//       success: true,
//       message: 'User registered successfully',
//       user: ghlUser,
//       token: ghlResponse.data.token || null
//     });

//   } catch (err) {
//     console.error('Registration error:', err.toJSON ? err.toJSON() : err);

//     return res.status(500).json({
//       success: false,
//       message: 'Failed to register user',
//       error: err.response?.data || err.message
//     });
//   }
// });

// module.exports = router;


const express = require('express');
const router = express.Router();
const axios = require('axios');
const freshdesk = require('../services/freshdesk');
const asana = require('../services/asana');

router.post('/', async (req, res) => {
  try {
    const { name, email, company } = req.body;
    if (!name || !email) {
      return res.status(400).json({ success: false, message: 'Name and email are required' });
    }

    // Register user in GoHighLevel
    // https://ryu.futuremultiverse.com/gohighlevel/api/ghl-register
    const ghlResponse = await axios.post('https://ryu.futuremultiverse.com/api/ghl-register', { name, email, company });
    const ghlUser = ghlResponse.data.ghlUser || ghlResponse.data.user || { name, email, company };

    // Respond immediately
    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      user: ghlUser,
      token: ghlResponse.data.token || null
    });

    // Fire-and-forget: hit Freshdesk and Asana
    // freshdesk.createTicket().catch(err => console.error('Freshdesk fire-and-forget error:', err));
      freshdesk
      .createTicket(email)
      .catch(err => console.error('Freshdesk fire-and-forget error:', err));

    asana.hitEndpoint().catch(err => console.error('Asana fire-and-forget error:', err));

  } catch (err) {
    console.error('Registration error:', err.toJSON ? err.toJSON() : err);
    return res.status(500).json({
      success: false,
      message: 'Failed to register user',
      error: err.response?.data || err.message
    });
  }
});

module.exports = router;
