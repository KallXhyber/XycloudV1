// File: api/chat.js

const { GoogleGenerativeAI } = require("@google/generative-ai");

// Inisialisasi dengan kunci API dari Vercel Environment Variables
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export default async function handler(request, response) {
   if (request.method !== 'POST') {
      return response.status(405).json({ error: "Method Not Allowed" });
   }
   
   try {
      const { message } = JSON.parse(request.body);
      
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });
      
      // Beri sedikit konteks agar AI tahu perannya
      const prompt = `Anda adalah KalBot, asisten AI untuk website XyCloud, layanan sewa PC cloud gaming. Jawab pertanyaan pengguna dengan ramah, singkat, dan informatif dalam Bahasa Indonesia. Pertanyaan pengguna: "${message}"`;
      
      const result = await model.generateContent(prompt);
      const aiResponse = await result.response;
      const text = aiResponse.text();
      
      return response.status(200).json({ reply: text });
      
   } catch (error) {
      console.error("Error calling Gemini API:", error);
      return response.status(500).json({ error: "Gagal berkomunikasi dengan AI." });
   }
}
