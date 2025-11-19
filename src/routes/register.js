// // routes/register.js
// const express = require('express')
// const router = express.Router()
// const axios = require('axios')
// const freshdesk = require('../services/freshdesk')
// const asana = require('../services/asana')

// router.post('/', async (req, res) => {
//   try {
//     const { name, email, company } = req.body
//     if (!name || !email) {
//       return res.status(400).json({ success: false, message: 'Name and email are required' })
//     }

//     // Register user in GoHighLevel
//     const ghlResponse = await axios.post(
//       'https://ryu.futuremultiverse.com/api/ghl-register',
//       { name, email, company }
//     )

//     const ghlUser = ghlResponse.data.ghlUser || ghlResponse.data.user || { name, email, company }

//     // Respond immediately to frontend
//     res.status(201).json({
//       success: true,
//       message: 'User registered successfully',
//       user: {
//         name: ghlUser.name,
//         email: ghlUser.email,
//         company: ghlUser.company || ''
//       },
//       token: ghlResponse.data.token || Buffer.from(email).toString('base64') // token for persistence
//     })

//     // Fire-and-forget: keep Freshdesk & Asana exactly as they are
//     freshdesk.createTicket(email).catch(err =>
//       console.error('Freshdesk fire-and-forget error:', err)
//     )

//     asana.hitEndpoint().catch(err =>
//       console.error('Asana fire-and-forget error:', err)
//     )
//   } catch (err) {
//     console.error('Registration error:', err.toJSON ? err.toJSON() : err)
//     res.status(500).json({
//       success: false,
//       message: 'Failed to register user',
//       error: err.response?.data || err.message
//     })
//   }
// })

// module.exports = router

// routes/register.js
const express = require('express')
const router = express.Router()
const axios = require('axios')
const freshdesk = require('../services/freshdesk')
const asana = require('../services/asana')

router.post('/', async (req, res) => {
  try {
    const { name, email, company, platform } = req.body;

    if (!name || !email) {
      return res.status(400).json({ success: false, message: 'Name and email are required' });
    }

    if (!platform) {
      return res.status(400).json({ success: false, message: 'Platform is required' });
    }

    // Register user in GoHighLevel
    const ghlResponse = await axios.post(
      'https://ryu.futuremultiverse.com/api/ghl-register',
      { name, email, company, platform }   
    );

    const ghlUser = ghlResponse.data.ghlUser || ghlResponse.data.user || { 
      name, 
      email, 
      company,
      platform

    };

    // Respond immediately to frontend
    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      user: {
        name: ghlUser.name,
        email: ghlUser.email,
        company: ghlUser.company || '',
        platform: ghlUser.platform,
      },
      token: ghlResponse.data.token || Buffer.from(email).toString('base64')
    });

    
    freshdesk.createTicket(email).catch(err =>
      console.error('Error creating freshdesk ticket:', err)
    );

    asana.hitEndpoint().catch(err =>
      console.error('Error creating asan task:', err)
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


module.exports = router

