// src/routes/ui.js
const express = require('express');
const router = express.Router();
const graceai = require('../services/graceai');
const multer = require('multer');
const ryuChat = require('../services/ryuChat');

// store files in RAM for GraceAI
const upload = multer({ storage: multer.memoryStorage() });

router.post('/api/test', upload.single('file'), async (req, res) => {
  try {
    const rawQuestion = req.body?.question || '';
    const file = req.file || null;

    let userId = req.body?.userId || `guest-${req.ip || 'local'}-${Date.now()}`;
    const userName = req.body?.userName || 'Guest';
    let chatId = req.body?.chatId || null;

    // 🔹 Only accept real Mongo ObjectId (24 hex characters)
    const mongoIdRegex = /^[0-9a-fA-F]{24}$/;
    if (chatId && !mongoIdRegex.test(chatId)) {
      console.warn('Ignoring non-Mongo chatId from client:', chatId);
      chatId = null; // force backend to create a real RYU chat
    }

    const question =
      rawQuestion ||
      (file
        ? `Please analyze the attached file "${file.originalname}" and summarize the important information.`
        : '');

    console.log('Received Question:', question);
    console.log('UserId:', userId, 'Existing chatId:', chatId);


    if (file) {
      console.log('Received File:', {
        name: file.originalname,
        type: file.mimetype,
        size: file.size + ' bytes',
      });
    }

    // 0) Upload file to Ryu files API (if present)
    let uploadedFileUrl = null;

    if (file) {
      try {
        const { fileUrl, raw } = await ryuChat.uploadFile(file);
        uploadedFileUrl = fileUrl;
        console.log('File uploaded to RYU. URL:', uploadedFileUrl);
        if (!uploadedFileUrl) {
          console.warn('RYU file upload response did not contain a clear fileUrl. Raw:', raw);
        }
      } catch (uploadErr) {
        console.error('Error while uploading file to RYU:', uploadErr.response?.data || uploadErr.message);
      }
    }

    let userMessageStoredByCreate = false;

    // 1) Create chat if needed
    if (!chatId) {
      try {
        const { chatId: newChatId, raw } = await ryuChat.createChat({
          userId,
          // If there is a file, we want the real user message to be stored via appendMessage (so that fileUrl is attached)
          initialMessage: file ? '' : question,
          name: userName,
        });
        console.log('RYU createChat response:', raw);

        if (newChatId) {
          chatId = newChatId;
          // Only mark as stored by createChat when there's no file.
          userMessageStoredByCreate = !file;
          console.log('New RYU chatId:', chatId);
        } else {
          console.warn('RYU did not return a chatId, raw=', raw);
        }
      } catch (ryuErr) {
        console.error('Error while creating RYU chat:', ryuErr.raw || ryuErr.message);
        // continue to GraceAI anyway
      }
    }

    // 2) Append user message (with fileUrl) if it wasn't stored by createChat
    if (chatId && !userMessageStoredByCreate) {
      try {
        await ryuChat.appendMessage({
          chatId,
          userId,
          role: 'user',
          message: question,
          fileName: file?.originalname || null,
          fileMime: file?.mimetype || null,
          fileUrl: uploadedFileUrl || null,
        });
      } catch (err) {
        console.error('Error while appending user message to RYU:', err.raw || err.message);
      }
    }

    // 3) Prepare GraceAI payload (still passes the actual file buffer so Grace can analyze content)
    const gracePayload = {
      question,
      user: { email: '' }, // optional, can include user email if available
      files: file
        ? [
            {
              name: file.originalname,
              buffer: file.buffer,
              mimeType: file.mimetype,
            },
          ]
        : [],
    };

    console.log('Sending to GraceAI:', {
      question: gracePayload.question,
      filesCount: gracePayload.files.length,
    });

    const response = await graceai.ask(gracePayload);

    // 4) Extract bot reply
    let reply = '';
    if (response?.choices?.[0]?.message?.content) {
      reply = response.choices[0].message.content;
    } else if (response?.reply) {
      reply = response.reply;
    } else if (typeof response === 'string') {
      reply = response;
    } else {
      reply = JSON.stringify(response);
    }

    // 5) Store bot reply in RYU (no file for bot)
    if (chatId && reply) {
      try {
        await ryuChat.appendMessage({
          chatId,
          userId,
          role: 'bot',
          message: reply,
          fileName: null,
          fileMime: null,
          fileUrl: null,
        });
      } catch (err) {
        console.error('Error while appending bot message to RYU:', err.raw || err.message);
      }
    }

    // 6) Send reply + chatId to frontend
    res.json({ reply, chatId: chatId || null });
  } catch (err) {
    console.error('GraceAI error:', err.stack || err.message);
    res.status(500).json({
      reply: 'Unable to reach the chat server. Please try again later.',
      chatId: null,
    });
  }
});

module.exports = router;
