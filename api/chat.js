// File: api/chat.js (Versi Final Menggunakan Model Gemma)

const { Groq } = require("groq-sdk");

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
});

module.exports = async (request, response) => {
    if (request.method !== 'POST') {
        return response.status(405).json({ error: "Method Not Allowed" });
    }
    
    try {
        const { message } = JSON.parse(request.body);

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
            // --- PERUBAHAN HANYA DI BARIS INI ---
            model: "gemma-7b-it", // Menggunakan model Gemma yang sangat umum
        });

        const reply = chatCompletion.choices[0]?.message?.content || "Maaf, saya tidak bisa merespons saat ini.";
        return response.status(200).json({ reply: reply });

    } catch (error) {
        console.error("ERROR KRITIS DI FUNGSI API:", error);
        return response.status(500).json({ error: "Gagal berkomunikasi dengan AI." });
    }
};
