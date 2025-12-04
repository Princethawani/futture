// src/services/graceai.js
const axios = require('axios');

/**
 * gracePayload = {
 *   question: string,
 *   user?: { email?: string },
 *   files?: [
 *     { name: string, buffer: Buffer, mimeType: string }
 *   ]
 * }
 */
exports.ask = async ({ question, user, files = [] }) => {
  try {
    const url = process.env.GRACEAI_API_URL;
    const apiKey = process.env.GRACEAI_API_KEY;

    // 1) Build text from any uploaded files
    const fileTextBlocks = [];

    for (const f of files) {
      if (!f) continue;

      const { name, buffer, mimeType } = f;

      // Handle text-like files directly (md, txt, json, csv, etc.)
      const isTextLike =
        (mimeType && mimeType.startsWith('text/')) ||
        (name && (
          name.endsWith('.md') ||
          name.endsWith('.txt') ||
          name.endsWith('.json') ||
          name.endsWith('.csv') ||
          name.endsWith('.log') ||
          name.endsWith('.xml') ||
          name.endsWith('.html') ||
          name.endsWith('.pdf') ||
          name.endsWith('.jpg') ||
          name.endsWith('.jpeg')
        ));

      if (isTextLike) {
        try {
          const text = buffer.toString('utf8');
          fileTextBlocks.push(
            `--- FILE: ${name} (${mimeType || 'unknown mime'}) ---\n${text}\n`
          );
        } catch (e) {
          console.error('Failed to read file buffer:', name, e);
          fileTextBlocks.push(
            `--- FILE: ${name} (${mimeType || 'unknown mime'}) ---\n[Error reading file content]\n`
          );
        }
      } else {
        // Non-text files: just let the model know they exist
        fileTextBlocks.push(
          `--- FILE: ${name} (${mimeType || 'unknown mime'}) ---\n[Binary or unsupported file type; content not extracted in this version]\n`
        );
      }
    }

    // 2) Build what the model will actually see
    let userContent = '';

    if (fileTextBlocks.length > 0) {
      userContent +=
        "The user has uploaded one or more files. " +
        "Below is the full text or a description of those files. " +
        "You CAN use this text to answer the question. " +
        "Do NOT say that you cannot view attachments, because the file contents are already provided here.\n\n";

      userContent += fileTextBlocks.join('\n');
      userContent += '\n';
    }

    userContent += `User's question: ${question || '(no explicit question, just analyze the file(s) and provide a helpful summary/insights).'}\n`;

    // 3) Send to GraceAI / OpenAI-compatible endpoint
    const response = await axios.post(
      url,
      {
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              "You are GraceAI, a helpful assistant for Future Multiverse / Ryu. " +
              "When file contents are included in the conversation, you are allowed to analyze them. " +
              "Never say that you cannot view attachments if the text of the file is provided.",
          },
          {
            role: "user",
            content: userContent,
          },
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
      }
    );

    return response.data;
  } catch (err) {
    if (err.code === "ENOTFOUND") {
      console.error(
        "Network error: Could not reach GraceAI API. Check your environmental variables."
      );
    }
    throw err;
  }
};
