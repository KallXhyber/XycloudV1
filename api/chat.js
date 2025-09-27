// File: api/chat.js (Versi Gemini)

const { GoogleGenerativeAI } = require("@google/generative-ai");

// Inisialisasi dengan kunci API dari Vercel Environment Variables
// Kode ini akan membaca variabel bernama GEMINI_API_KEY
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export default async function handler(request, response) {
  // Pastikan request adalah metode POST
  if (request.method !== 'POST') {
    return response.status(405).json({ error: "Method Not Allowed" });
  }
  
  try {
    // Ambil pesan dari pengguna
    const { message } = JSON.parse(request.body);

    // Dapatkan model AI Gemini
    const model = genAI.getGenerativeModel({ model: "gemini-pro"});

    // Beri sedikit konteks agar AI tahu perannya
    const prompt = `Anda adalah KalBot, asisten AI untuk website XyCloud, layanan sewa PC cloud gaming. Jawab pertanyaan pengguna dengan ramah, singkat, dan informatif dalam Bahasa Indonesia. Pertanyaan pengguna: "${message}"`;

    const result = await model.generateContent(prompt);
    const aiResponse = await result.response;
    const text = aiResponse.text();

    // Kirim balasan dari AI ke browser
    return response.status(200).json({ reply: text });

  } catch (error) {
    // Ini akan menampilkan error yang lebih detail di Vercel Logs
    console.error("Error calling Gemini API:", error);
    return response.status(500).json({ error: "Gagal berkomunikasi dengan AI." });
  }
}
