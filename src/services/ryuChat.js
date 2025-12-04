// services/ryuChat.js
const axios = require('axios');
const FormData = require('form-data');

const RYU_BASE_URL = process.env.RYU_BASE_URL || 'https://backend.futuremultiverse.dev/api/v1';
const RYU_AUTH_HEADER = process.env.RYU_AUTH_HEADER;

if (!RYU_AUTH_HEADER) {
  console.warn('[RYU] WARNING: RYU_AUTH_HEADER is not set!');
}

/**
 * Helper: Get headers for JSON requests
 */
function getHeaders() {
  return {
    'Content-Type': 'application/json',
    'Authorization': RYU_AUTH_HEADER,
  };
}

/**
 * Helper: parse MongoDB date object to JS Date
 */
function parseMongoDate(mongoDateObj) {
  if (!mongoDateObj) return null;

  if (mongoDateObj.$date?.$numberLong) {
    return new Date(Number(mongoDateObj.$date.$numberLong));
  }

  if (mongoDateObj.$date) {
    return new Date(mongoDateObj.$date);
  }

  return new Date(mongoDateObj);
}

/**
 * Upload a file to Ryu files endpoint
 * file: multer file object (with .buffer, .originalname, .mimetype)
 */
async function uploadFile(file) {
  if (!file) throw new Error('uploadFile: file is required');

  const url = `${RYU_BASE_URL}/files/upload`;
  console.log('[RYU] POST (file upload)', url);

  const form = new FormData();
  form.append('file', file.buffer, {
    filename: file.originalname,
    contentType: file.mimetype || 'application/octet-stream',
  });

  const headers = {
    Authorization: RYU_AUTH_HEADER,
    ...form.getHeaders(), // multipart/form-data with boundary
  };

  try {
    const resp = await axios.post(url, form, { headers });
    const data = resp.data || {};
    console.log('[RYU] uploadFile response data:', data);

    // The backend returns:
    // {
    //   relative_uri: "/storage/202512034040_Test_PDF_document.pdf",
    //   file_name: "...",
    //   size: 3042,
    //   content_type: "application/pdf"
    // }

    const relativeUri =
      data?.relative_uri ||
      data?.data?.relative_uri ||
      null;

    let fileUrl = null;

    if (relativeUri) {
      // Build full absolute URL
      const base = (process.env.RYU_FILE_BASE_URL || 'https://backend.futuremultiverse.dev').replace(/\/$/, '');
      fileUrl = `${base}${relativeUri}`;
    }

    if (!fileUrl) {
      console.warn('[RYU] uploadFile: Could not compute fileUrl, returning raw data');
    } else {
      console.log('[RYU] uploadFile: Final fileUrl =', fileUrl);
    }

    return { fileUrl, raw: data };

  } catch (err) {
    console.error('[RYU] uploadFile error:', err.response?.data || err.message);
    throw err;
  }
}


/**
 * Create a chat for a user
 */
async function createChat({ userId, initialMessage, name }) {
  if (!userId) throw new Error('createChat: userId is required');

  const url = `${RYU_BASE_URL}/ryu-chats/user/${encodeURIComponent(userId)}`;
  console.log('[RYU] POST', url);

  const body = {
    initialMessage: initialMessage || '',
    name: name || 'Guest',
  };

  try {
    const resp = await axios.post(url, body, { headers: getHeaders() });
    const data = resp.data || {};
    console.log('[RYU] createChat response data:', data);

    const chatId = data?.data?._id?.$oid || null;
    return { chatId, raw: data };
  } catch (err) {
    console.error('[RYU] createChat error:', err.response?.data || err.message);
    return { chatId: null, raw: err.response?.data || err.message };
  }
}

/**
 * Append a message to an existing chat
 */
async function appendMessage({ chatId, userId, role, message, fileName, fileMime, fileUrl }) {
  if (!chatId) throw new Error('appendMessage: chatId is required');
  if (!role) throw new Error('appendMessage: role is required');
  if (!message) throw new Error('appendMessage: message is required');

  // map bot assistant (RYU API requirement)
  const mappedRole =
    role === 'bot' ? 'assistant' :
    role === 'user' ? 'user' :
    role === 'system' ? 'system' :
    role;

  const url = `${RYU_BASE_URL}/ryu-chats/user/${encodeURIComponent(userId)}/${encodeURIComponent(chatId)}/messages`;
  console.log('[RYU] POST', url);

  const body = {
    role: mappedRole,
    content: message,
    // Use snake_case --?
    file_name: fileName || null,
    file_mime: fileMime || null,
    file_url: fileUrl || null,
  };

  console.log('[RYU] appendMessage request body:', body);

  try {
    const resp = await axios.post(url, body, { headers: getHeaders() });
    console.log('[RYU] appendMessage response data:', resp.data);
    return resp.data;
  } catch (err) {
    console.error('[RYU] appendMessage error:', err.response?.data || err.message);
    return { success: false, error: err.response?.data || err.message };
  }
}

/**
 * Get chat and messages (requires userId + chatId)
 */
async function getChat({ userId, chatId }) {
  if (!userId) throw new Error('getChat: userId is required');
  if (!chatId) throw new Error('getChat: chatId is required');

  const url = `${RYU_BASE_URL}/ryu-chats/user/${encodeURIComponent(userId)}/${encodeURIComponent(chatId)}`;
  console.log('[RYU] GET', url);

  try {
    const resp = await axios.get(url, { headers: getHeaders() });
    console.log('[RYU] getChat response data:', resp.data);

    let chat = null;
    let messages = [];

    const data = resp.data?.data || {};

    if (data.chat) {
      const rawChat = data.chat;
      chat = {
        ...rawChat,
        // handle both created_at and createdAt, updated_at and updatedAt
        created_at: parseMongoDate(rawChat.created_at || rawChat.createdAt),
        updated_at: parseMongoDate(rawChat.updated_at || rawChat.updatedAt),
      };
    }

    if (Array.isArray(data.messages)) {
      messages = data.messages.map((msg) => {
        const created = msg.created_at || msg.createdAt;
        return {
          ...msg,
          created_at: parseMongoDate(created),
        };
      });
    }

    return { chat, messages, raw: resp.data };
  } catch (err) {
    console.error('[RYU] getChat error:', err.response?.data || err.message);
    return { chat: null, messages: [], error: err.response?.data || err.message };
  }
}

/**
 * Get all chats for a user
 */
async function getAllChatsForUser(userId) {
  if (!userId) throw new Error('getAllChatsForUser: userId is required');

  const url = `${RYU_BASE_URL}/ryu-chats/user/${encodeURIComponent(userId)}`;
  console.log('[RYU] GET', url);

  try {
    const resp = await axios.get(url, { headers: getHeaders() });
    console.log('[RYU] getAllChatsForUser response data:', resp.data);

    const chats = (resp.data?.data || []).map(chat => {
      const created = chat.created_at || chat.createdAt;
      const updated = chat.updated_at || chat.updatedAt;

      return {
        ...chat,
        created_at: parseMongoDate(created),
        updated_at: parseMongoDate(updated),
      };
    });

    return { chats, raw: resp.data };
  } catch (err) {
    console.error('[RYU] getAllChatsForUser error:', err.response?.data || err.message);
    return { chats: [], error: err.response?.data || err.message };
  }
}

module.exports = {
  uploadFile,
  createChat,
  appendMessage,
  getChat,
  getAllChatsForUser,
};
