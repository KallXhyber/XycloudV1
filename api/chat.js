// api/chat.js (Versi Perbaikan Anti-Gagal)

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

        const chatCompletion = await groq.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content: "Anda adalah KalBot, asisten AI untuk website XyCloud, layanan sewa PC cloud gaming. Jawab pertanyaan pengguna dengan ramah, singkat, dan informatif dalam Bahasa Indonesia."
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
        console.error("Error calling Groq API:", error);
        return response.status(500).json({ error: "Gagal berkomunikasi dengan AI." });
    }
};
