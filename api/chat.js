// File: api/chat.js (Versi Final dengan Pengecekan Login)

const { Groq } = require("groq-sdk");
const admin = require("firebase-admin");

// Inisialisasi Firebase Admin SDK dari Environment Variable
try {
  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
  }
} catch (e) {
  console.error('Firebase Admin Initialization Error:', e);
}

// Inisialisasi Groq dari Environment Variable
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

module.exports = async (request, response) => {
    if (request.method !== 'POST') {
        return response.status(405).json({ error: "Method Not Allowed" });
    }

    try {
        // 1. Verifikasi Pengguna
        const { authorization } = request.headers;
        if (!authorization || !authorization.startsWith('Bearer ')) {
            return response.status(401).json({ error: 'Unauthorized: No token provided.' });
        }
        const idToken = authorization.split('Bearer ')[1];
        // Jika token tidak valid, baris di bawah ini akan error dan masuk ke blok catch
        await admin.auth().verifyIdToken(idToken); 

        // 2. Jika verifikasi berhasil, lanjutkan ke AI
        const { message } = JSON.parse(request.body);

        const chatCompletion = await groq.chat.completions.create({
            messages: [
                { role: "system", content: "Anda adalah KalBot, asisten AI untuk website XyCloud, layanan sewa PC cloud gaming. Jawab pertanyaan pengguna dengan ramah, singkat, dan informatif dalam Bahasa Indonesia." },
                { role: "user", content: message }
            ],
            model: "gemma-7b-it",
        });

        const reply = chatCompletion.choices[0]?.message?.content || "Maaf, ada masalah saat memproses jawaban.";
        return response.status(200).json({ reply });

    } catch (error) {
        if (error.code && error.code.startsWith('auth/')) {
            return response.status(403).json({ error: 'Forbidden: Invalid token.' });
        }
        console.error("API Error:", error);
        return response.status(500).json({ error: "Gagal berkomunikasi dengan AI." });
    }
};
