// File: api/chat.js (Versi Perbaikan Final)

import Groq from "groq-sdk";

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
});

// Perubahan ada di sini: kita definisikan handler-nya terlebih dahulu
const handler = async (request, response) => {
    if (request.method !== 'POST') {
        return response.status(405).json({ error: "Method Not Allowed" });
    }
    
    try {
        // Vercel otomatis mem-parse body jika config-nya benar
        const { message } = request.body; 

        if (!message) {
            return response.status(400).json({ error: "Message is required." });
        }

        const chatCompletion = await groq.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content: "Anda adalah KalBot, asisten AI untuk website XyCloud..."
                },
                {
                    role: "user",
                    content: message,
                },
            ],
            model: "llama3-8b-8192",
        });

        const reply = chatCompletion.choices[0]?.message?.content || "Maaf, saya tidak bisa merespons saat ini.";
        return response.status(200).json({ reply: reply });

    } catch (error) {
        console.error("Error in API function:", error);
        return response.status(500).json({ error: "Gagal berkomunikasi dengan AI." });
    }
};

// Lalu kita ekspor dengan cara ini
export default handler;
