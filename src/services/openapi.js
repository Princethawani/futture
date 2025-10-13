// src/services/openapi.js

const fetch = require('node-fetch');

exports.ask = async ({ question, user}) => {
    try{
        const response = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers:{
                "Content-Type": "application/json",
                "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
            },
            body: JSON.stringify({
                model: "gpt-3.5-turbo",
                message: [
                    {
                    role: "system",
                    content: "You are GraceAI, a helpful and friendly assistant supporting Future Catalyst.",
                    },
                    {
                        role: "user",
                        content: question
                    },
                ],
            }),
        });

        const data = await response.json();

        const answer = 
            data.choices?.[0]?.message?.content ||
            "Sorry — I'm not sure. I'll get help from the team.";

        return { answer };
    }catch (err){
        console.error("Error in OpenAI ask:", err);
        return { answer: "Sorry — I'm having trouble right now. I'll get help from the team." };
    }
};
