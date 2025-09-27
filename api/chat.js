// File: api/chat.js (Versi Debugging Server)

const { Groq } = require("groq-sdk");

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
});

module.exports = async (request, response) => {
    console.log("Fungsi /api/chat dimulai...");

    if (request.method !== 'POST') {
        console.log("Metode request salah, bukan POST.");
        return response.status(405).json({ error: "Method Not Allowed" });
    }
    
    try {
        console.log("Mencoba mem-parsing request body...");
        console.log("Raw body:", request.body); // Ini akan menunjukkan apa yang sebenarnya Vercel terima
        const { message } = JSON.parse(request.body);
        console.log("Pesan setelah di-parsing:", message);

        if (!message) {
            console.log("Error: Pesan kosong setelah di-parsing.");
            return response.status(400).json({ error: "Message is required." });
        }

        console.log(`Memanggil API Groq dengan model 'mixtral-8x7b-32768' dan pesan: "${message}"`);
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
            model: "mixtral-8x7b-32768", // Menggunakan model yang sangat stabil
        });

        const reply = chatCompletion.choices[0]?.message?.content || "Maaf, saya tidak bisa merespons saat ini.";
        console.log("Berhasil mendapatkan balasan dari Groq.");
        return response.status(200).json({ reply: reply });

    } catch (error) {
        console.error("ERROR KRITIS DI FUNGSI API:", error); // Ini akan mencatat error lengkapnya
        return response.status(500).json({ error: "Gagal berkomunikasi dengan AI." });
    }
};
