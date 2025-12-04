// routes/history.js
const express = require('express');
const router = express.Router();
const ryuChat = require('../services/ryuChat');

/**
 * GET /api/history?userId=xxx&chatId=xxx
 * Returns a single chat + its messages
 */
router.get('/api/history', async (req, res) => {
  try {
    const { userId, chatId } = req.query;

    if (!userId || !chatId) {
      return res
        .status(400)
        .json({ error: 'both userId & chatId are required' });
    }

    const { chat, messages, error } = await ryuChat.getChat({ userId, chatId });

    if (error) {
      return res
        .status(500)
        .json({ error: 'Failed to load chat history', details: error });
    }

    // Optional: sort messages by created_at ascending
    const sortedMessages = Array.isArray(messages)
      ? [...messages].sort((a, b) => {
          const t1 = new Date(a.created_at).getTime();
          const t2 = new Date(b.created_at).getTime();
          return t1 - t2;
        })
      : [];

    // This will include fileUrl, fileName, etc. as saved in Ryu
    res.json({ chat, messages: sortedMessages });
  } catch (err) {
    console.error('History error:', err.response?.data || err.message);
    res.status(500).json({ error: 'Failed to load chat history' });
  }
});

/**
 * GET /api/history/chats?userId=xxx
 * Returns all chats for a user (for a chat list sidebar, etc.)
 */
router.get('/chats', async (req, res) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    const { chats, error } = await ryuChat.getAllChatsForUser(userId);

    if (error) {
      return res
        .status(500)
        .json({ error: 'Failed to load user chats', details: error });
    }

    // Sort chats by updated_at desc (most recent first)
    const sortedChats = Array.isArray(chats)
      ? [...chats].sort((a, b) => {
          const t1 = new Date(a.updated_at).getTime();
          const t2 = new Date(b.updated_at).getTime();
          return t2 - t1;
        })
      : [];

    res.json({ chats: sortedChats });
  } catch (err) {
    console.error('History /chats error:', err.response?.data || err.message);
    res.status(500).json({ error: 'Failed to load user chats' });
  }
});

module.exports = router;
