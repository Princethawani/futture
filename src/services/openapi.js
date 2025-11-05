// src/services/openapi.js
// const fetch = require('node-fetch');
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));


exports.ask = async ({ question, user }) => {
  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini", // you can also use gpt-3.5-turbo
        messages: [
          {
            role: "system",
            content: "You are GraceAI, a helpful and friendly assistant supporting Future Catalyst.",
          },
          {
            role: "user",
            content: question,
          },
        ],
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("OpenAI API error:", data);
      return { answer: `Error: ${data.error?.message || "Request failed"}` };
    }

    const answer =
      data.choices?.[0]?.message?.content ||
      "Sorry — I'm not sure. I'll get help from the team.";

    return { answer };
  } catch (err) {
    console.error("Error in OpenAI ask:", err);
    return {
      answer:
        "Sorry — I'm having trouble right now. I'll get help from the team.",
    };
  }
};
