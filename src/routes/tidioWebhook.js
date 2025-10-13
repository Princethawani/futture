// src/routes/tidioWebhook.js

// const graceai = require('../services/graceai');
const openai = require('../services/openapi');
const tidio = require('../services/tidio');


exports.handle = async (req, res) => {
  try {
    const payload = req.body;

    // --- Extract info ---
    const conversationId =
      payload.conversationId || payload.conversation_id || payload.data?.conversationId;

    const messageText =
      payload.message?.text ||
      payload.data?.message?.text ||
      payload.text ||
      payload.messageText;
      
    const contact = payload.contact || payload.data?.contact || {};
    const email = contact.email || payload.email;

    // LOG the incoming message for debugging
    console.log('\n Incoming message from Tidio:');
    console.log('Conversation ID:', conversationId);
    console.log('From:', email || 'unknown');
    console.log('Text:', messageText);

    if (!conversationId || !messageText) {
      console.warn('Missing conversationId or messageText');
      return res.status(400).json({ error: 'missing conversationId or messageText' });
    }

    // --- Send to GraceAI ---
    const aiResp = await graceai.ask({ question: messageText, user: { email, name: contact.name } });

    // LOG the AI response before sending back
    console.log('\n GraceAI response:');
    console.dir(aiResp, { depth: null });

    const answer = aiResp.answer || "Sorry — I'm not sure. I'll get help from the team.";

    // For now: just print instead of replying to Tidio (optional)
    console.log('\n Reply that would be sent back to Tidio:');
    console.log(answer);

    // You can skip sending to Tidio while testing
    // await tidio.sendMessage(conversationId, answer);

    return res.status(200).json({ status: 'logged', answer });
  } catch (err) {
    console.error('Webhook handler error:', err);
    return res.status(500).json({ error: 'internal_error' });
  }
};
