import { auth, db, supabase, GoogleAuthProvider, signInWithPopup, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, getAdditionalUserInfo, collection, doc, getDoc, getDocs, setDoc, addDoc, updateDoc, deleteDoc, onSnapshot, query, where, orderBy, limit, serverTimestamp } from './firebase-init.js';

// --- KODE UMUM (Berjalan di semua halaman) ---
const loadingOverlay = document.getElementById('loading-overlay');
if(loadingOverlay) {
    window.addEventListener('load', () => { 
        loadingOverlay.style.opacity = '0'; 
        setTimeout(() => { loadingOverlay.style.display = 'none'; }, 500); 
    }); 
}

const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
const mobileMenu = document.getElementById('mobile-menu');
const desktopNav = document.querySelector('header nav.hidden');
if (mobileMenuToggle && mobileMenu && desktopNav) {
    mobileMenu.innerHTML = desktopNav.innerHTML;
    mobileMenuToggle.addEventListener('click', () => {
        mobileMenu.classList.toggle('hidden');
    });
}

const showToast = (type, message) => {
    const container = document.getElementById('toast-container');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = `toast toast--${type}`;
    const icons = {
        success: `<svg class="toast__icon" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="#4ade80"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>`,
        error: `<svg class="toast__icon" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="#f87171"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" /></svg>`,
        info: `<svg class="toast__icon" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="#60a5fa"><path stroke-linecap="round" stroke-linejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.852l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>`
    };
    toast.innerHTML = `${icons[type]}<p class="toast__message">${message}</p>`;
    container.appendChild(toast);
    setTimeout(() => {
        toast.classList.add('toast--hiding');
        toast.addEventListener('animationend', () => toast.remove(), { once: true });
    }, 5000);
};

const showLiveFeed = (message) => {
    const container = document.getElementById('live-feed-container');
    if (!container) return;
    const feed = document.createElement('div');
    feed.className = 'live-feed';
    feed.innerHTML = `<svg class="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path></svg><p class="text-sm text-gray-300">${message}</p>`;
    container.appendChild(feed);
    setTimeout(() => {
        feed.classList.add('live-feed--hiding');
        feed.addEventListener('animationend', () => feed.remove(), { once: true });
    }, 7000);
};

// --- LOGIKA HALAMAN SPESIFIK & NOTIFIKASI ---

const listenForUnreadMessages = () => {
    const chatLinkButton = document.getElementById('chat-link-button');
    if (!chatLinkButton || !auth.currentUser) return;
    const lastVisitTimestamp = parseInt(localStorage.getItem('lastChatVisit') || '0');
    const lastVisitDate = new Date(lastVisitTimestamp);
    const unreadMessagesQuery = query(collection(db, "live_chat"), where("createdAt", ">", lastVisitDate));
    onSnapshot(unreadMessagesQuery, (snapshot) => {
        const hasUnread = snapshot.docs.some(doc => doc.data().userId !== auth.currentUser.uid);
        if (hasUnread) {
            chatLinkButton.classList.add('has-notification');
        } else {
            chatLinkButton.classList.remove('has-notification');
        }
    });
};

const currentPage = window.location.pathname;

if (currentPage.endsWith('/') || currentPage.endsWith('index.html')) {
    const testimonialContainer = document.getElementById('testimonial-container');
    const testimonialsQuery = query(collection(db, 'testimonials'), where('isApproved', '==', true), orderBy('createdAt', 'desc'), limit(3));
    onSnapshot(testimonialsQuery, (snapshot) => {
        if (!testimonialContainer) return;
        if (snapshot.empty) { testimonialContainer.innerHTML = `<div class="bg-gray-800 p-8 rounded-3xl border border-gray-700 space-y-4 col-span-3"><p class="text-gray-400 text-center">Jadilah yang pertama memberikan testimoni!</p></div>`; return; }
        let testimonialsHTML = '';
        snapshot.forEach(doc => {
            const t = doc.data();
            const initial = (t.userName || 'U').charAt(0).toUpperCase();
            testimonialsHTML += `<div class="bg-gray-800 p-8 rounded-3xl border border-gray-700 space-y-4"><div class="flex items-center space-x-4"><img src="${t.userImage || `https://placehold.co/64x64/3b82f6/ffffff?text=${initial}`}" alt="Avatar" class="w-16 h-16 rounded-full"><div><h4 class="text-lg font-bold text-white">${t.userName}</h4></div></div><p class="text-gray-300">"${t.text}"</p></div>`;
        });
        testimonialContainer.innerHTML = testimonialsHTML;
    });

    const pcStatusContainer = document.getElementById('pc-status-container');
    if (pcStatusContainer) {
        const pcQuery = query(collection(db, 'pc_statuses'), orderBy('name'));
        onSnapshot(pcQuery, snapshot => { /* ... (kode render pc status slider) ... */ });
    }
} 
else if (currentPage.endsWith('login.html')) {
    // Logika untuk halaman login ada di dalam onAuthStateChanged
} 
else if (currentPage.endsWith('paket.html')) {
    // Logika untuk halaman paket ada di dalam onAuthStateChanged
}
else if (currentPage.endsWith('akun-gta.html')) {
    const container = document.getElementById('gta-account-container');
    if (container) {
        const gtaAccountsQuery = query(collection(db, 'gta_accounts'), orderBy('price'));
        onSnapshot(gtaAccountsQuery, (snapshot) => {
            if (snapshot.empty) { container.innerHTML = `<p class="text-gray-400 text-center lg:col-span-3">Saat ini belum ada akun yang tersedia.</p>`; return; }
            let cardsHTML = '';
            snapshot.forEach(doc => {
                const account = doc.data();
                let featuresHTML = '';
                account.features.forEach(feature => {
                    const isNegative = feature.startsWith('-'); const text = isNegative ? feature.substring(1) : feature;
                    const iconColor = isNegative ? 'text-red-400' : 'text-blue-400'; const icon = isNegative ? '✖' : '✔';
                    featuresHTML += `<li class="flex items-start gap-3"><span class="${iconColor} mt-1">${icon}</span><div>${text}</div></li>`;
                });
                cardsHTML += `<div class="max-w-md mx-auto bg-gray-800 rounded-3xl overflow-hidden shadow-2xl border border-gray-700 flex flex-col"><img src="https://placehold.co/600x400/1f2937/e5e7eb?text=${encodeURIComponent(account.title)}" alt="${account.title}" class="w-full h-48 object-cover"><div class="p-8 flex flex-col flex-grow"><h3 class="text-2xl font-bold text-blue-400 mb-2">${account.title}</h3><p class="text-3xl font-extrabold text-white mb-6">Rp ${Number(account.price).toLocaleString('id-ID')}<span class="text-lg font-medium text-gray-400">/permanen</span></p><ul class="text-sm text-gray-300 space-y-3 mb-8 flex-grow">${featuresHTML}</ul><a href="https://wa.me/6283116632566?text=Halo%20Admin,%20saya%20mau%20beli%20akun:%20${encodeURIComponent(account.title)}" target="_blank" class="block w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-full transition-colors text-center mt-auto">Beli via WhatsApp</a></div></div>`;
            });
            container.innerHTML = cardsHTML;
        });
    }
}
else if (currentPage.endsWith('dashboard.html')) {
    // Logika halaman dashboard
}
else if (currentPage.endsWith('transaksi.html')) {
    const container = document.getElementById('transactions-container');
    if (container) {
        const transactionsQuery = query(collection(db, 'orders'), where('status', 'in', ['dikonfirmasi', 'selesai']), orderBy('createdAt', 'desc'));
        onSnapshot(transactionsQuery, (snapshot) => { /* ... (kode render transaksi) ... */ });
    }
}
else if (currentPage.endsWith('admin.html')) {
    // Logika halaman admin
}
else if (currentPage.endsWith('kontak.html')) {
    // Logika halaman kontak
}
else if (currentPage.endsWith('ruang-chat.html')) {
    const chatBody = document.getElementById('chat-body');
    const chatInput = document.getElementById('chat-input');
    const sendButton = document.getElementById('send-button');

    localStorage.setItem('lastChatVisit', Date.now().toString());
    const chatLinkButton = document.getElementById('chat-link-button');
    if (chatLinkButton) chatLinkButton.classList.remove('has-notification');

    const addChatMessage = (msgData) => {
        const msgElement = document.createElement('div');
        const currentUser = auth.currentUser;
        const sender = (currentUser && currentUser.uid === msgData.userId) ? 'user' : 'bot';
        msgElement.classList.add('chat-message', 'flex', 'flex-col', 'max-w-xs', 'md:max-w-md');
        if (sender === 'user') {
            msgElement.classList.add('self-end', 'items-end');
        } else {
            msgElement.classList.add('self-start', 'items-start');
        }
        let senderName = (sender === 'user') ? 'Anda' : (msgData.userName || 'Anonim');
        msgElement.innerHTML = `
            <p class="text-xs font-bold mb-1 ${sender === 'user' ? 'text-right' : 'text-left'} text-blue-300">${senderName}</p>
            <div class="p-3 rounded-lg ${sender === 'user' ? 'bg-blue-600' : 'bg-gray-700'}">${msgData.text}</div>`;
        chatBody.appendChild(msgElement);
        chatBody.scrollTop = chatBody.scrollHeight;
    };

    const sendMessage = async () => {
        const messageText = chatInput.value.trim();
        const user = auth.currentUser;
        if (!messageText) return;
        if (!user) {
            showToast('error', 'Anda harus login untuk mengirim pesan.');
            return;
        }
        chatInput.value = '';
        try {
            const userDoc = await getDoc(doc(db, 'users', user.uid));
            const userData = userDoc.data();
            await addDoc(collection(db, 'live_chat'), {
                text: messageText,
                userId: user.uid,
                userName: userData.displayName || 'Anonim',
                createdAt: serverTimestamp()
            });
        } catch (error) {
            console.error("Error sending message:", error);
            showToast('error', 'Gagal mengirim pesan.');
        }
    };

    sendButton.addEventListener('click', sendMessage);
    chatInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') sendMessage(); });
    
    const liveChatQuery = query(collection(db, "live_chat"), orderBy("createdAt", "desc"), limit(50));
    onSnapshot(liveChatQuery, (querySnapshot) => {
        if (!chatBody) return;
        chatBody.innerHTML = '';
        const messages = [];
        querySnapshot.forEach((doc) => {
            messages.push(doc.data());
        });
        messages.reverse().forEach(msg => addChatMessage(msg));
    });
}

// --- FUNGSI UTAMA SETELAH USER LOGIN & OTENTIKASI ---
onAuthStateChanged(auth, user => {
    hideLoading();
    const loginButton = document.getElementById('header-login-button');
    const userMenu = document.getElementById('header-user-menu');
    const mobileLoginButton = document.querySelector('#mobile-menu #header-login-button');
    const mobileUserMenu = document.querySelector('#mobile-menu #header-user-menu');

    if (user) {
        // User logged in
        if (loginButton) loginButton.classList.add('hidden');
        if (userMenu) userMenu.classList.remove('hidden');
        if (mobileLoginButton) mobileLoginButton.classList.add('hidden');
        if (mobileUserMenu) mobileUserMenu.classList.remove('hidden');

        getDoc(doc(db, 'users', user.uid)).then(userDoc => {
            if (userDoc.exists()) {
                const userData = userDoc.data();
                const avatarUrl = userData.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(userData.displayName)}&background=random`;
                
                document.querySelectorAll('#header-user-avatar').forEach(el => el.src = avatarUrl);
                
                const adminLink = document.getElementById('admin-panel-link');
                const mobileAdminLink = document.querySelector('#mobile-menu #admin-panel-link');
                if (userData.isAdmin) {
                    if(adminLink) adminLink.classList.remove('hidden');
                    if(mobileAdminLink) mobileAdminLink.classList.remove('hidden');
                }
            }
        });

        // Mulai dengarkan notifikasi chat
        listenForUnreadMessages();
    } else {
        // User logged out
        if (loginButton) loginButton.classList.remove('hidden');
        if (userMenu) userMenu.classList.add('hidden');
        if (mobileLoginButton) mobileLoginButton.classList.remove('hidden');
        if (mobileUserMenu) mobileUserMenu.classList.add('hidden');
    }
});

document.body.addEventListener('click', (e) => {
    if (e.target.matches('#header-logout-button, #mobile-menu #header-logout-button')) {
        signOut(auth).then(() => showToast('success', 'Anda berhasil logout.')).catch(err => showToast('error', err.message));
    }
});
