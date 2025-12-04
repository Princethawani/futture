// routes/me.js
const express = require('express')
const router = express.Router()

router.get('/api/me', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1] // Bearer token
  if (!token) return res.status(401).json({ success: false, message: 'No token provided' })

  try {
    // Decode simple token (for real use JWT)
    const email = Buffer.from(token, 'base64').toString('utf8')
    return res.json({
      success: true,
      user: { name: email.split('@')[0], email } // mock user data
    })
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Invalid token' })
  }
})

module.exports = router
