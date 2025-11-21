// const express = require('express');
// const router = express.Router();
// const graceai = require('../services/graceai'); // make sure this exists

// // --------------------
// // Test Chat API 
// // --------------------
// router.post('/api/test', async (req, res) => {
//   const question = req.body.question || '';

//   try {
//     // Call GraceAI
//     const response = await graceai.ask({
//       question,
//       user: { email: "test@example.com" } // adjust as needed
//     });

//     // Extract the actual text from the Chat Completion response
//     let reply = '';

//     if (response?.choices?.[0]?.message?.content) {
//       // Chat completion format
//       reply = response.choices[0].message.content;
//     } else if (typeof response === 'string') {
//       // Already a string
//       reply = response;
//     } else if (typeof response === 'object' && response !== null) {
//       // Fallback: pick common fields or stringify
//       reply = response.reply || response.text || JSON.stringify(response);
//     } else {
//       reply = String(response);
//     }

//     res.json({ reply });
//   } catch (err) {
//     console.error('GraceAI error:', err.message || err);

//     // Friendly fallback message
//     res.status(500).json({
//       reply: 'Unable to reach the chat server. Please try again later.'
//     });
//   }
// });

// module.exports = router;
const express = require('express');
const router = express.Router();
const graceai = require('../services/graceai');
const multer = require('multer');

// store in RAM so we can pass file.buffer into GraceAI
const upload = multer({ storage: multer.memoryStorage() });

// --------------------
// Test Chat API 
// --------------------
router.post('/api/test', upload.single('file'), async (req, res) => {
  try {
    const question = req.body?.question || "";
    const file = req.file || null;

    console.log("Received Question:", question);

    if (file) {
      console.log("Received File:", {
        name: file.originalname,
        type: file.mimetype,
        size: file.size + " bytes",
      });
    }

    // -----------------------------
    // Build a GraceAI-compatible request
    // -----------------------------
    const gracePayload = {
      question,
      user: { email: "test@example.com" },
      files: file ? [
        {
          name: file.originalname,
          buffer: file.buffer,       // <-- the actual file content
          mimeType: file.mimetype
        }
      ] : []
    };

    // -----------------------------
    // CALL GRACEAI WITH FILE + TEXT
    // -----------------------------
    const response = await graceai.ask(gracePayload);

    // -----------------------------
    // Extract reply safely
    // -----------------------------
    let reply = "";

    if (response?.choices?.[0]?.message?.content) {
      reply = response.choices[0].message.content;
    } else if (response?.reply) {
      reply = response.reply;
    } else if (typeof response === "string") {
      reply = response;
    } else {
      reply = JSON.stringify(response);
    }

    // Send back to frontend
    res.json({ reply });
  } catch (err) {
    console.error("GraceAI error:", err.stack || err);
    res.status(500).json({
      reply: "Unable to reach the chat server. Please try again later."
    });
  }
});

module.exports = router;

