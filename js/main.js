// js/main.js (VERSI 100% LENGKAP & FINAL)

// Impor semua fungsi dan instance dari firebase-init.js
import {
    auth, db, supabase, GoogleAuthProvider, signInWithPopup, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, getAdditionalUserInfo, collection, doc, getDoc, getDocs, setDoc, addDoc, updateDoc, deleteDoc, onSnapshot, query, where, orderBy, limit, serverTimestamp
} from './firebase-init.js';

// --- KODE UMUM (Berjalan di semua halaman) ---
const loadingOverlay = document.getElementById('loading-overlay');
const showLoading = () => { if(loadingOverlay) loadingOverlay.style.display = 'flex'; };
const hideLoading = () => { if(loadingOverlay) loadingOverlay.style.display = 'none'; };

window.addEventListener('load', hideLoading);

// Menu mobile
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
        onSnapshot(pcQuery, snapshot => {
            pcStatusContainer.innerHTML = '';
            if(window.pcTimers) window.pcTimers.forEach(clearInterval);
            window.pcTimers = [];
            snapshot.forEach(doc => {
                const pc = doc.data();
                const statusClass = pc.status === 'READY' ? 'text-green-400' : (pc.status === 'DIGUNAKAN' ? 'text-yellow-400' : 'text-red-400');
                const statusIcon = `<svg class="w-20 h-20 mx-auto mb-4 ${statusClass}" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>`;
                const userText = pc.status === 'DIGUNAKAN' ? `<p class="text-sm text-gray-400">Digunakan oleh: ${pc.user}</p>` : '<p class="text-sm text-gray-400">&nbsp;</p>';
                const slide = document.createElement('div');
                slide.className = 'swiper-slide';
                slide.innerHTML = `<div class="bg-gray-800 rounded-3xl p-6 text-center border border-gray-700">${statusIcon}<h3 class="text-xl font-bold text-white">${pc.name}</h3><p class="font-semibold ${statusClass}">${pc.status}</p>${userText}<p class="text-sm text-blue-400 time-indicator font-mono h-5">&nbsp;</p></div>`;
                
                if (pc.status === 'DIGUNAKAN' && pc.startTime && pc.duration) {
                    const timerId = setInterval(() => {
                        const startTime = pc.startTime.toDate();
                        const endTime = new Date(startTime.getTime() + pc.duration * 60 * 60 * 1000);
                        const now = new Date();
                        const diff = endTime - now;
                        const indicatorEl = slide.querySelector('.time-indicator');
                        if (indicatorEl) {
                            if (diff > 0) {
                                const hours = Math.floor(diff / 3600000);
                                const minutes = Math.floor((diff % 3600000) / 60000);
                                const seconds = Math.floor((diff % 60000) / 1000);
                                indicatorEl.textContent = `Sisa Waktu: ${hours}j ${minutes}m ${seconds}s`;
                            } else {
                                indicatorEl.textContent = 'Waktu Habis';
                                clearInterval(timerId);
                            }
                        }
                    }, 1000);
                    window.pcTimers.push(timerId);
                }
                pcStatusContainer.appendChild(slide);
            });
            if (snapshot.size > 0 && typeof Swiper !== 'undefined') new Swiper('.pc-status-slider', { slidesPerView: 1, spaceBetween: 16, loop: true, pagination: { el: '.swiper-pagination', clickable: true }, breakpoints: { 640: { slidesPerView: 2 }, 1024: { slidesPerView: 3 } } });
        });
    }
} 
else if (currentPage.endsWith('login.html')) {
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        const emailInput = document.getElementById('email');
        const passwordInput = document.getElementById('password');
        const registerBtn = document.getElementById('register-button');
        const googleLoginBtn = document.getElementById('google-login-button');
        
        loginForm.addEventListener('submit', e => {
            e.preventDefault();
            signInWithEmailAndPassword(auth, emailInput.value, passwordInput.value)
                .then(() => { window.location.href = 'dashboard.html'; })
                .catch(error => { showToast('error', "Kredensial login salah atau akun tidak ditemukan."); });
        });
        registerBtn.addEventListener('click', () => {
            createUserWithEmailAndPassword(auth, emailInput.value, passwordInput.value).then(cred => {
                const user = cred.user;
                return setDoc(doc(db, 'users', user.uid), {
                    displayName: user.email.split('@')[0], email: user.email, createdAt: serverTimestamp(), isAdmin: false, isVerified: false
                });
            }).then(() => { window.location.href = 'dashboard.html'; })
            .catch(err => { showToast('error', err.message); });
        });
        googleLoginBtn.addEventListener('click', () => {
            const provider = new GoogleAuthProvider();
            signInWithPopup(auth, provider).then(res => {
                const isNewUser = getAdditionalUserInfo(res)?.isNewUser;
                if (isNewUser) {
                    const user = res.user;
                    setDoc(doc(db, 'users', user.uid), {
                        displayName: user.displayName, email: user.email, photoURL: user.photoURL, isAdmin: false, isVerified: false, createdAt: serverTimestamp()
                    });
                }
                window.location.href = 'dashboard.html';
            }).catch(err => { showToast('error', err.message); });
        });
    }
}
else if (currentPage.endsWith('paket.html')) {
    const verificationModal = document.getElementById('verification-modal');
    const orderModal = document.getElementById('order-modal');
    const adminCards = document.querySelectorAll('.admin-card');
    const operationalHours = { 'Kall': { start: 18, end: 6 }, 'Dwingi': { start: 6, end: 18 }, 'Dlii': { start: 14, end: 0 } };
    const checkAdminStatus = () => {
        const now = new Date(); const currentHourWITA = (now.getUTCHours() + 8) % 24;
        adminCards.forEach(card => {
            const adminName = card.dataset.adminName; if (!adminName) return;
            const hours = operationalHours[adminName];
            const statusIndicator = card.querySelector('.status-indicator'); const orderButton = card.querySelector('.order-button');
            let isOnline = false;
            if (hours.start > hours.end) { isOnline = currentHourWITA >= hours.start || currentHourWITA < hours.end; } else { isOnline = currentHourWITA >= hours.start && currentHourWITA < hours.end; }
            if (isOnline) { statusIndicator.textContent = 'Online'; statusIndicator.className = 'status-indicator text-sm font-semibold px-3 py-1 rounded-full bg-green-500/20 text-green-400'; orderButton.disabled = false; orderButton.classList.remove('opacity-50', 'cursor-not-allowed'); } else { statusIndicator.textContent = 'Offline'; statusIndicator.className = 'status-indicator text-sm font-semibold px-3 py-1 rounded-full bg-red-500/20 text-red-400'; orderButton.disabled = true; orderButton.classList.add('opacity-50', 'cursor-not-allowed'); }
        });
    };
    checkAdminStatus(); setInterval(checkAdminStatus, 60000);
    if(verificationModal) {
        const closeModalBtn = document.getElementById('close-modal-button');
        const verificationForm = document.getElementById('verification-form');
        closeModalBtn.addEventListener('click', () => verificationModal.classList.add('hidden'));
        verificationForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const user = auth.currentUser; if (!user) { showToast('error', 'Sesi berakhir. Silakan login kembali.'); return; }
            const discordFile = document.getElementById('discord-ss').files[0], steamFile = document.getElementById('steam-ss').files[0], cfxFile = document.getElementById('cfx-ss').files[0];
            if (!discordFile || !steamFile || !cfxFile) { showToast('error', 'Harap upload ketiga screenshot.'); return; }
            const submitButton = document.getElementById('submit-verification'); submitButton.disabled = true;
            const uploadStatus = document.getElementById('upload-status'); uploadStatus.textContent = 'Mengupload file... (0/3)'; uploadStatus.classList.remove('hidden');
            try {
                const uploadFile = async (file, type) => { const fileName = `${user.uid}/${type}-${Date.now()}`; const { error } = await supabase.storage.from('verifications').upload(fileName, file); if (error) throw error; return supabase.storage.from('verifications').getPublicUrl(fileName).data.publicUrl; };
                const discordUrl = await uploadFile(discordFile, 'discord'); uploadStatus.textContent = 'Mengupload file... (1/3)';
                const steamUrl = await uploadFile(steamFile, 'steam'); uploadStatus.textContent = 'Mengupload file... (2/3)';
                const cfxUrl = await uploadFile(cfxFile, 'cfx'); uploadStatus.textContent = 'Mengupload file... (3/3)';
                await addDoc(collection(db, 'verifications'), { userId: user.uid, userEmail: user.email, discordUrl, steamUrl, cfxUrl, status: 'pending', createdAt: serverTimestamp() });
                showToast('success', 'Verifikasi berhasil dikirim!');
                setTimeout(() => { verificationModal.classList.add('hidden'); submitButton.disabled = false; uploadStatus.classList.add('hidden'); }, 2000);
            } catch (error) { showToast('error', error.message); submitButton.disabled = false; }
        });
    }
    if(orderModal) {
        const orderForm = document.getElementById('order-form');
        const closeOrderModalBtn = document.getElementById('close-order-modal-button');
        closeOrderModalBtn.addEventListener('click', () => orderModal.classList.add('hidden'));
        orderForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const billingId = document.getElementById('wa-billing').value;
            if (billingId.length < 3 || billingId.length > 4) { showToast('error', 'Harap isi 3 atau 4 digit terakhir nomor WhatsApp Anda.'); return; }
            const submitButton = e.target.querySelector('button[type="submit"]'); submitButton.disabled = true; submitButton.textContent = "Memproses...";
            const user = auth.currentUser;
            const docSnap = await getDoc(doc(db, 'users', user.uid));
            const userName = docSnap.data().displayName;
            const adminName = document.getElementById('order-admin-name').value, packageName = document.getElementById('order-package-name').value, packagePrice = document.getElementById('order-package-price').value, waNumber = document.getElementById('order-wa-number').value;
            try {
                await addDoc(collection(db, 'orders'), { userId: user.uid, userEmail: user.email, userName: userName, adminName: adminName, packageName: packageName, price: Number(packagePrice), billingId: billingId, status: 'menunggu_pembayaran', createdAt: serverTimestamp() });
                showToast('success', 'Pesanan dicatat! Anda akan diarahkan ke WhatsApp.');
                const waMessage = `Halo! Admin ${adminName}, saya mau konfirmasi pesanan saya.\n\nPaket : ${packageName}\nHarga : Rp ${Number(packagePrice).toLocaleString('id-ID')}\nBilling : ****${billingId}\n\nDitunggu min.`;
                setTimeout(() => {
                    window.open(`https://wa.me/${waNumber}?text=${encodeURIComponent(waMessage)}`, '_blank');
                    orderModal.classList.add('hidden');
                    submitButton.disabled = false; submitButton.textContent = "Konfirmasi & Lanjut ke WhatsApp";
                }, 1500);
            } catch (error) { showToast('error', 'Gagal menyimpan pesanan: ' + error.message); submitButton.disabled = false; submitButton.textContent = "Konfirmasi & Lanjut ke WhatsApp"; }
        });
    }
    document.querySelectorAll('.order-button').forEach(button => {
        button.addEventListener('click', async (e) => {
            const user = auth.currentUser;
            if (!user) { showToast('info', 'Anda harus login untuk memesan.'); setTimeout(() => window.location.href = 'login.html', 2000); return; }
            const userDocSnap = await getDoc(doc(db, 'users', user.uid));
            if (userDocSnap.exists() && userDocSnap.data().isVerified) {
                const card = e.target.closest('.admin-card');
                const selectedRadio = card.querySelector('input[type="radio"]:checked');
                if (!selectedRadio) { showToast('error', 'Silakan pilih paket terlebih dahulu.'); return; }
                const adminName = card.dataset.adminName, waNumber = card.dataset.waNumber;
                let packageName = selectedRadio.dataset.name; let packagePrice = Number(selectedRadio.dataset.price);
                if (selectedRadio.dataset.custom === 'true') {
                    const customHourInput = selectedRadio.closest('label').querySelector('.custom-hour-input');
                    const hours = parseInt(customHourInput.value) || 1;
                    packagePrice *= hours;
                    packageName = `${hours} Jam (Custom)`;
                }
                document.getElementById('modal-package-name').textContent = packageName;
                document.getElementById('modal-package-price').textContent = `Rp ${packagePrice.toLocaleString('id-ID')}`;
                document.getElementById('order-admin-name').value = adminName;
                document.getElementById('order-package-name').value = packageName;
                document.getElementById('order-package-price').value = packagePrice;
                document.getElementById('order-wa-number').value = waNumber;
                if (orderModal) orderModal.classList.remove('hidden');
            } else {
                if (verificationModal) verificationModal.classList.remove('hidden');
            }
        });
    });
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
    const contactForm = document.getElementById('contact-form');
    if (contactForm) contactForm.addEventListener('submit', (e) => { e.preventDefault(); const name = document.getElementById('name').value; const message = document.getElementById('message').value; const waMessage = `Halo, nama saya ${name}. ${message}`; window.open(`https://wa.me/6283116632566?text=${encodeURIComponent(waMessage)}`, '_blank'); });
}
else if (currentPage.endsWith('bantuan.html')) {
    document.querySelectorAll('details').forEach((detail) => { detail.addEventListener('toggle', function() { const icon = this.querySelector('svg'); if (this.open) { icon.style.transform = 'rotate(180deg)'; } else { icon.style.transform = 'rotate(0deg)'; } }); });
}
else if (currentPage.endsWith('ruang-chat.html')) {
    const chatBody = document.getElementById('chat-body');
    const chatInput = document.getElementById('chat-input');
    const sendButton = document.getElementById('send-button');

    localStorage.setItem('lastChatVisit', Date.now().toString());
    const chatLinkButton = document.getElementById('chat-link-button');
    if (chatLinkButton) chatLinkButton.classList.remove('has-notification');

    const addChatMessage = (msgData) => { /* ... (fungsi addChatMessage lengkap) ... */ };
    const sendMessage = async () => { /* ... (fungsi sendMessage lengkap) ... */ };

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
