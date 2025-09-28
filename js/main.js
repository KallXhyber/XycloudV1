// js/main.js (VERSI 100% LENGKAP & FINAL)

// Impor semua fungsi dan instance dari firebase-init.js
import {
    auth, db, supabase, GoogleAuthProvider, signInWithPopup, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, getAdditionalUserInfo, collection, doc, getDoc, getDocs, setDoc, addDoc, updateDoc, deleteDoc, onSnapshot, query, where, orderBy, limit, serverTimestamp
} from './firebase-init.js';

// --- FUNGSI-FUNGSI GLOBAL ---
const playSound = (type) => {
    try {
        if (!window.Tone) { return; }
        const now = Tone.now();
        if (type === 'success') { const synth = new Tone.Synth().toDestination(); synth.triggerAttackRelease("C5", "8n", now); synth.triggerAttackRelease("G5", "8n", now + 0.2); } 
        else if (type === 'error') { const synth = new Tone.FMSynth().toDestination(); synth.triggerAttackRelease("G3", "8n", now); synth.triggerAttackRelease("C3", "8n", now + 0.1); } 
        else if (type === 'info') { const synth = new Tone.AMSynth().toDestination(); synth.triggerAttackRelease("A4", "16n", now); }
    } catch (e) { console.warn("Tone.js error: ", e); }
};

const showToast = (type, message) => {
    const container = document.getElementById('toast-container');
    if (!container) return;
    playSound(type);
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

// --- OTENTIKASI & KODE YANG BERJALAN DI SEMUA HALAMAN ---
onAuthStateChanged(auth, user => {
    const isLoggedIn = !!user;
    const mobileMenuContainer = document.getElementById('mobile-menu');
    const headerUserMenu = document.getElementById('header-user-menu');
    const headerLoginButton = document.getElementById('header-login-button');
    let mobileMenuHTML = `<ul class="flex flex-col space-y-4 text-center"><li><a href="index.html" class="block py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors">Beranda</a></li><li><a href="paket.html" class="block py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors">Paket</a></li><li><a href="akun-gta.html" class="block py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors">Akun GTA</a></li><li><a href="bantuan.html" class="block py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors">Bantuan</a></li><li><a href="transaksi.html" class="block py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors">Transaksi</a></li><li class="border-t border-gray-700 my-2"></li>`;

    if (isLoggedIn) {
        const fifteenSecondsAgo = new Date(Date.now() - 15000);
        const ordersQuery = query(collection(db, 'orders'), where('createdAt', '>=', fifteenSecondsAgo));
        onSnapshot(ordersQuery, snapshot => {
            snapshot.docChanges().forEach(change => {
                if (change.type === 'added') {
                    const order = change.doc.data();
                    const userName = order.userName || user.displayName || 'Seseorang';
                    showLiveFeed(`<b>${userName}</b> baru saja memesan <b>${order.packageName}</b>`);
                }
            });
        });
        
        const userDocRef = doc(db, 'users', user.uid);
        getDoc(userDocRef).then(docSnap => {
            if (!docSnap.exists()) return;
            const userData = docSnap.data();
            const avatar = user.photoURL || `https://placehold.co/32x32/3b82f6/ffffff?text=${(userData.displayName || 'U').charAt(0).toUpperCase()}`;
            if(headerUserMenu) {
                const avatarImg = headerUserMenu.querySelector('#header-user-avatar');
                if (avatarImg) avatarImg.src = avatar;
                headerUserMenu.classList.remove('hidden');
            }
            if(headerLoginButton) headerLoginButton.classList.add('hidden');
            if(userData.isAdmin) {
                const adminLink = document.getElementById('admin-panel-link');
                if(adminLink) adminLink.classList.remove('hidden');
                mobileMenuHTML += `<li><a href="admin.html" class="block py-2 px-4 rounded-lg hover:bg-gray-700 font-bold">Panel Admin</a></li>`;
            }
            mobileMenuHTML += `<li><a href="dashboard.html" class="block py-3 px-4 rounded-full bg-gray-600 hover:bg-gray-500 font-bold">Dashboard</a></li><li id="mobile-logout-button-container"><button class="w-full block py-2 px-4 rounded-lg hover:bg-gray-700 text-red-400">Logout</button></li>`;
            if(mobileMenuContainer) {
                mobileMenuContainer.innerHTML = mobileMenuHTML + '</ul>';
                mobileMenuContainer.querySelector('#mobile-logout-button-container button').addEventListener('click', handleLogout);
            }
        });
    } else {
        if(headerUserMenu) headerUserMenu.classList.add('hidden');
        if(headerLoginButton) headerLoginButton.classList.remove('hidden');
        if(mobileMenuContainer) mobileMenuContainer.innerHTML = mobileMenuHTML + `<li><a href="login.html" class="block py-3 px-4 rounded-full bg-blue-600 hover:bg-blue-700 font-bold">Login</a></li></ul>`;
    }
});

const handleLogout = () => {
    signOut(auth).then(() => {
        showToast('info', 'Anda telah logout.');
        setTimeout(() => window.location.href = 'index.html', 1000);
    }).catch(error => showToast('error', error.message));
};

document.body.addEventListener('click', e => {
    if (e.target.closest('#header-logout-button')) handleLogout();
});

// --- LOGIKA HALAMAN-HALAMAN SPESIFIK ---

if (window.location.pathname.endsWith('login.html')) {
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
} else if (window.location.pathname.endsWith('dashboard.html')) {
    const dashboardContent = document.getElementById('dashboard-content');
    const dashboardLoader = document.getElementById('dashboard-loader');
    const statusBadge = document.getElementById('verification-status-badge');
    onAuthStateChanged(auth, user => {
        if (user) {
            const userDocRef = doc(db, 'users', user.uid);
            const displayVerificationStatus = async (userData) => {
                if (!statusBadge) return;
                if (userData.isVerified) {
                    statusBadge.textContent = 'Akun Terverifikasi';
                    statusBadge.className = 'mt-4 inline-block text-sm font-semibold px-3 py-1 rounded-full bg-green-500/20 text-green-400';
                } else {
                    const q = query(collection(db, 'verifications'), where('userId', '==', user.uid), orderBy('createdAt', 'desc'), limit(1));
                    const querySnapshot = await getDocs(q);
                    if (querySnapshot.empty) {
                        statusBadge.textContent = 'Belum Terverifikasi';
                        statusBadge.className = 'mt-4 inline-block text-sm font-semibold px-3 py-1 rounded-full bg-gray-500/20 text-gray-400';
                    } else {
                        const latestVerification = querySnapshot.docs[0].data();
                        if (latestVerification.status === 'pending') {
                            statusBadge.textContent = 'Verifikasi Menunggu Persetujuan';
                            statusBadge.className = 'mt-4 inline-block text-sm font-semibold px-3 py-1 rounded-full bg-yellow-500/20 text-yellow-400';
                        } else if (latestVerification.status === 'rejected') {
                            statusBadge.textContent = 'Verifikasi Ditolak';
                            statusBadge.className = 'mt-4 inline-block text-sm font-semibold px-3 py-1 rounded-full bg-red-500/20 text-red-400';
                        }
                    }
                }
            };
            getDoc(userDocRef).then(docSnap => {
                if (docSnap.exists()) {
                    const userData = docSnap.data();
                    document.getElementById('profile-name').textContent = userData.displayName || 'Nama Pengguna';
                    document.getElementById('profile-email').textContent = userData.email;
                    document.getElementById('display-name').value = userData.displayName || '';
                    document.getElementById('profile-pic').src = user.photoURL || userData.photoURL || `https://placehold.co/128x128/3b82f6/ffffff?text=${(userData.displayName || 'U').charAt(0).toUpperCase()}`;
                    displayVerificationStatus(userData);
                    dashboardLoader.classList.add('hidden');
                    dashboardContent.classList.remove('hidden');
                } else {
                    setDoc(userDocRef, {
                        displayName: user.displayName || user.email.split('@')[0], email: user.email, photoURL: user.photoURL, isAdmin: false, isVerified: false, createdAt: serverTimestamp()
                    }).then(() => window.location.reload());
                }
            });
            document.getElementById('edit-profile-form').addEventListener('submit', e => {
                e.preventDefault();
                const newName = document.getElementById('display-name').value;
                updateDoc(doc(db, 'users', user.uid), { displayName: newName }).then(() => {
                    showToast('success', 'Profil berhasil diperbarui!');
                    document.getElementById('profile-name').textContent = newName;
                });
            });
            document.getElementById('testimonial-form').addEventListener('submit', async (e) => {
                e.preventDefault();
                const text = document.getElementById('testimonial-text').value;
                await addDoc(collection(db, 'testimonials'), {
                    userId: user.uid, userName: document.getElementById('profile-name').textContent, userImage: document.getElementById('profile-pic').src, text: text, createdAt: serverTimestamp(), isApproved: false
                });
                showToast('success', 'Terima kasih atas ulasan Anda!');
                e.target.reset();
            });
        } else {
            window.location.href = 'login.html';
        }
    });
} else if (window.location.pathname.endsWith('index.html') || window.location.pathname.endsWith('/') || window.location.pathname === '') {
    const testimonialContainer = document.getElementById('testimonial-container');
    const q = query(collection(db, 'testimonials'), where('isApproved', '==', true), orderBy('createdAt', 'desc'), limit(3));
    onSnapshot(q, (snapshot) => {
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
            if (snapshot.size > 0 && typeof Swiper !== 'undefined') new Swiper('.pc-status-slider', { slidesPerView: 1, spaceBetween: 16, pagination: { el: '.swiper-pagination', clickable: true }, breakpoints: { 640: { slidesPerView: 2 }, 1024: { slidesPerView: 3 } } });
        });
    }
} else if (window.location.pathname.endsWith('paket.html')) {
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
} else if (window.location.pathname.endsWith('akun-gta.html')) {
    const container = document.getElementById('gta-account-container');
    if (container) {
        const q = query(collection(db, 'gta_accounts'), orderBy('price'));
        onSnapshot(q, (snapshot) => {
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
        }, (error) => {
            console.error("Gagal memuat akun GTA:", error);
            container.innerHTML = `<p class="text-red-400 text-center lg:col-span-3">Gagal memuat data. Silakan coba lagi nanti.</p>`;
        });
    }
} else if (window.location.pathname.endsWith('kontak.html')) {
    const contactForm = document.getElementById('contact-form');
    if (contactForm) contactForm.addEventListener('submit', (e) => { e.preventDefault(); const name = document.getElementById('name').value; const message = document.getElementById('message').value; const waMessage = `Halo, nama saya ${name}. ${message}`; window.open(`https://wa.me/6283116632566?text=${encodeURIComponent(waMessage)}`, '_blank'); });
} else if (window.location.pathname.endsWith('bantuan.html')) {
    document.querySelectorAll('details').forEach((detail) => { detail.addEventListener('toggle', function() { const icon = this.querySelector('svg'); if (this.open) { icon.style.transform = 'rotate(180deg)'; } else { icon.style.transform = 'rotate(0deg)'; } }); });
} else if (window.location.pathname.endsWith('transaksi.html')) {
    const container = document.getElementById('transactions-container');
    if (container) {
        const q = query(collection(db, 'orders'), where('status', 'in', ['dikonfirmasi', 'selesai']), orderBy('createdAt', 'desc'));
        onSnapshot(q, (snapshot) => {
            if (snapshot.empty) { container.innerHTML = `<p class="text-gray-400 text-center">Belum ada transaksi yang dikonfirmasi.</p>`; return; }
            let html = '';
            snapshot.forEach(doc => {
                const order = doc.data(); const date = order.createdAt.toDate().toLocaleDateString('id-ID');
                const statusClass = order.status === 'selesai' ? 'bg-green-500/20 text-green-400' : 'bg-blue-500/20 text-blue-400';
                html += `<div class="bg-gray-800 p-4 rounded-xl border border-gray-700 flex justify-between items-center"><div><p class="font-bold text-white">${order.packageName}</p><p class="text-sm text-gray-400">Oleh: ${order.userName} via Admin ${order.adminName}</p></div><div class="text-right"><p class="text-sm font-semibold px-3 py-1 rounded-full ${statusClass}">${order.status}</p><p class="text-xs text-gray-500 mt-1">${date}</p></div></div>`;
            });
            container.innerHTML = html;
        }, (error) => {
            console.error("Gagal memuat transaksi:", error);
            container.innerHTML = `<p class="text-red-400 text-center">Gagal memuat data transaksi.</p>`;
        });
    }
}

// --- LOGIKA HALAMAN ADMIN ---
if (window.location.pathname.endsWith('admin.html')) {
    
    let loggedInAdminName = null;
    const adminSection = document.getElementById('admin-section');
    const authCheck = document.getElementById('admin-auth-check');
    const tabs = document.querySelectorAll('.admin-tab');
    const tabContents = document.querySelectorAll('.admin-tab-content');
    const submissionsContainer = document.getElementById('submissions-container');
    const pcManagementContainer = document.getElementById('pc-management-container');
    const pcStatusModal = document.getElementById('pc-status-modal');
    const pcStatusForm = document.getElementById('pc-status-form');
    const closeModalButton = document.getElementById('close-pc-modal-button');
    const activeOrdersContainer = document.getElementById('active-orders-container');
    const transactionsListContainer = document.getElementById('transactions-list-container');
    const gtaForm = document.getElementById('gta-account-form');
    const gtaFormTitle = document.getElementById('gta-form-title');
    const gtaAccountId = document.getElementById('gta-account-id');
    const gtaTitleInput = document.getElementById('gta-title');
    const gtaPriceInput = document.getElementById('gta-price');
    const gtaFeaturesInput = document.getElementById('gta-features');
    const gtaCancelBtn = document.getElementById('gta-form-cancel');
    const gtaAccountsList = document.getElementById('gta-accounts-list');

    onAuthStateChanged(auth, user => {
        if (user) {
            const userDocRef = doc(db, 'users', user.uid);
            getDoc(userDocRef).then(docSnap => {
                if (docSnap.exists() && docSnap.data().isAdmin) {
                    loggedInAdminName = docSnap.data().adminName || null;
                    if (!loggedInAdminName) { showToast('error', 'Akun admin Anda belum memiliki field "adminName" di database.'); }
                    authCheck.classList.add('hidden');
                    adminSection.classList.remove('hidden');
                    loadPcManagement();
                } else {
                    showToast('error', 'Akses ditolak.'); window.location.href = 'index.html';
                }
            }).catch(error => {
                showToast('error', 'Gagal memeriksa otorisasi.'); console.error(error);
            });
        } else {
            showToast('info', 'Anda harus login sebagai admin.'); window.location.href = 'login.html';
        }
    });

    if(tabs.length > 0) {
        tabs.forEach(tab => {
            tab.addEventListener('click', (e) => {
                const targetTab = e.target.dataset.tab;
                tabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                tabContents.forEach(content => content.classList.add('hidden'));
                const targetContent = document.getElementById(targetTab);
                if (targetContent) {
                    targetContent.classList.remove('hidden');
                    if (targetTab === 'verifications') loadVerifications();
                    else if (targetTab === 'pc-management') loadPcManagement();
                    else if (targetTab === 'active-orders') loadActiveOrders();
                    else if (targetTab === 'transactions-management') loadTransactions();
                    else if (targetTab === 'gta-management') loadGtaAccounts();
                }
            });
        });
    }
    
    const renderVerifications = (snapshot) => {
        if (!submissionsContainer) return;
        if (snapshot.empty) { submissionsContainer.innerHTML = `<p class="text-gray-400 text-center">Tidak ada permintaan verifikasi baru.</p>`; return; }
        let html = '';
        snapshot.forEach(doc => {
            const submission = doc.data(); const id = doc.id; const date = submission.createdAt.toDate().toLocaleDateString('id-ID');
            html += `<div class="bg-gray-800 p-6 rounded-2xl border border-gray-700"><div class="flex justify-between items-start mb-4"><div><p class="font-bold text-white">${submission.userEmail}</p><p class="text-sm text-gray-400">ID Pengguna: ${submission.userId}</p><p class="text-sm text-gray-400">Tanggal: ${date}</p></div><div class="flex gap-2"><button class="btn-approve bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-full text-sm" data-doc-id="${id}" data-user-id="${submission.userId}">Setujui</button><button class="btn-reject bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-full text-sm" data-doc-id="${id}">Tolak</button></div></div><div class="grid grid-cols-1 sm:grid-cols-3 gap-4"><a href="${submission.discordUrl}" target="_blank" class="block"><img src="${submission.discordUrl}" alt="Discord SS" class="screenshot-img"><p class="text-center text-sm mt-2 text-blue-400">Lihat Discord</p></a><a href="${submission.steamUrl}" target="_blank" class="block"><img src="${submission.steamUrl}" alt="Steam SS" class="screenshot-img"><p class="text-center text-sm mt-2 text-blue-400">Lihat Steam</p></a><a href="${submission.cfxUrl}" target="_blank" class="block"><img src="${submission.cfxUrl}" alt="Cfx.re SS" class="screenshot-img"><p class="text-center text-sm mt-2 text-blue-400">Lihat Cfx.re</p></a></div></div>`;
        });
        submissionsContainer.innerHTML = html;
    };
    const loadVerifications = () => { onSnapshot(query(collection(db, 'verifications'), where('status', '==', 'pending')), renderVerifications, (err) => { console.error(err); showToast('error', 'Gagal memuat verifikasi.'); }); };
    if (submissionsContainer) { submissionsContainer.addEventListener('click', async (e) => {
        const target = e.target;
        if (target.matches('.btn-approve')) {
            target.disabled = true; target.textContent = 'Menyetujui...';
            const docId = target.dataset.docId; const userId = target.dataset.userId;
            try { await updateDoc(doc(db, 'users', userId), { isVerified: true }); await updateDoc(doc(db, 'verifications', docId), { status: 'approved' }); showToast('success', 'Pengguna berhasil diverifikasi.'); } 
            catch (error) { showToast('error', `Gagal memverifikasi: ${error.message}`); target.disabled = false; target.textContent = 'Setujui'; }
        }
        if (target.matches('.btn-reject')) {
            target.disabled = true; target.textContent = 'Menolak...';
            const docId = target.dataset.docId;
            try { await updateDoc(doc(db, 'verifications', docId), { status: 'rejected' }); showToast('info', 'Permintaan verifikasi ditolak.'); } 
            catch (error) { showToast('error', `Gagal menolak: ${error.message}`); target.disabled = false; target.textContent = 'Tolak'; }
        }
    }); }
    const renderPcManagement = (snapshot) => {
        if (!pcManagementContainer) return;
        let html = '';
        snapshot.forEach(doc => {
            const pc = doc.data(); const pcId = doc.id;
            const statusClass = pc.status === 'READY' ? 'ready' : (pc.status === 'DIGUNAKAN' ? 'digunakan' : 'offline');
            const statusText = pc.status.charAt(0).toUpperCase() + pc.status.slice(1).toLowerCase();
            html += `<div class="bg-gray-800 p-6 rounded-2xl border border-gray-700"><h3 class="font-bold text-white text-lg">${pc.name}</h3><div class="flex items-center my-2"><span class="pc-status-dot ${statusClass}"></span><p class="text-sm font-semibold">${statusText}</p></div><p class="text-sm text-gray-400 h-5 mb-4">${pc.status === 'DIGUNAKAN' ? `Oleh: ${pc.user || ''}` : ''}</p><button class="btn-ubah-status w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full text-sm" data-doc-id="${pcId}">Ubah Status</button></div>`;
        });
        pcManagementContainer.innerHTML = html;
    };
    const loadPcManagement = () => { onSnapshot(query(collection(db, 'pc_statuses'), orderBy('name')), renderPcManagement, (err) => { console.error(err); showToast('error', 'Gagal memuat data PC.'); }); };
    if (pcManagementContainer) { pcManagementContainer.addEventListener('click', async (e) => {
        const target = e.target.closest('.btn-ubah-status');
        if (target) {
            const docId = target.dataset.docId;
            const docSnap = await getDoc(doc(db, 'pc_statuses', docId));
            if (docSnap.exists()) {
                const pcData = docSnap.data();
                pcStatusForm.elements['modal-pc-id'].value = docId;
                document.getElementById('modal-pc-name').textContent = `Ubah Status: ${pcData.name}`;
                pcStatusForm.elements['status'].value = pcData.status;
                pcStatusForm.elements['modal-user-name'].value = pcData.user || '';
                pcStatusForm.elements['modal-duration'].value = pcData.duration || '';
                const userInputContainer = document.getElementById('user-input-container');
                if(userInputContainer) userInputContainer.classList.toggle('hidden', pcData.status !== 'DIGUNAKAN');
                pcStatusModal.classList.remove('hidden');
            }
        }
    }); }
    if (pcStatusForm) {
        pcStatusForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const docId = pcStatusForm.elements['modal-pc-id'].value;
            const newStatus = pcStatusForm.elements['status'].value;
            const userName = pcStatusForm.elements['modal-user-name'].value;
            const duration = Number(pcStatusForm.elements['modal-duration'].value);
            let dataToUpdate = { status: newStatus };
            if (newStatus === 'DIGUNAKAN') {
                if (!userName || !duration) { showToast('error', 'Nama pengguna dan durasi wajib diisi.'); return; }
                dataToUpdate.user = userName; dataToUpdate.duration = duration; dataToUpdate.startTime = serverTimestamp(); 
            } else { dataToUpdate.user = ''; dataToUpdate.startTime = null; dataToUpdate.duration = null; }
            try { await updateDoc(doc(db, 'pc_statuses', docId), dataToUpdate); showToast('success', 'Status PC berhasil diperbarui.'); pcStatusModal.classList.add('hidden'); } 
            catch (error) { showToast('error', `Gagal memperbarui: ${error.message}`); }
        });
        pcStatusForm.elements['status'].forEach(radio => { radio.addEventListener('change', (e) => { document.getElementById('user-input-container').classList.toggle('hidden', e.target.value !== 'DIGUNAKAN'); }); });
    }
    if (closeModalButton) closeModalButton.addEventListener('click', () => pcStatusModal.classList.add('hidden'));
    const renderActiveOrders = (snapshot) => {
        if (!activeOrdersContainer) return;
        if (snapshot.empty) { activeOrdersContainer.innerHTML = `<p class="text-gray-400 text-center">Tidak ada pesanan yang sedang berjalan.</p>`; return; }
        let html = '';
        snapshot.forEach(pcDoc => {
            const order = pcDoc.data(); const pcId = pcDoc.id;
            const startTime = order.startTime ? order.startTime.toDate().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : 'N/A';
            html += `<div class="bg-gray-800 p-6 rounded-2xl border border-gray-700 flex justify-between items-center"><div><p class="font-bold text-white">${order.name}</p><p class="text-sm text-gray-300">Pengguna: <span class="font-semibold text-blue-400">${order.user}</span></p><p class="text-sm text-gray-400">Mulai sejak: ${startTime} WITA</p></div><button class="btn-selesaikan-pesanan bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded-full text-sm" data-doc-id="${pcId}">Selesaikan</button></div>`;
        });
        activeOrdersContainer.innerHTML = html;
    };
    const loadActiveOrders = () => { onSnapshot(query(collection(db, 'pc_statuses'), where('status', '==', 'DIGUNAKAN')), renderActiveOrders, (err) => { console.error(err); showToast('error', 'Gagal memuat pesanan.'); }); };
    if (activeOrdersContainer) { activeOrdersContainer.addEventListener('click', async (e) => {
        const target = e.target.closest('.btn-selesaikan-pesanan');
        if (target) {
            target.disabled = true; target.textContent = 'Memproses...';
            const docId = target.dataset.docId;
            try { await updateDoc(doc(db, 'pc_statuses', docId), { status: 'READY', user: '', startTime: null, duration: null }); showToast('success', 'Pesanan telah diselesaikan.'); } 
            catch (error) { showToast('error', `Gagal menyelesaikan: ${error.message}`); target.disabled = false; target.textContent = 'Selesaikan'; }
        }
    }); }
    const renderTransactions = (snapshot) => {
        if (!transactionsListContainer) return;
        if (snapshot.empty) { transactionsListContainer.innerHTML = `<p class="text-gray-400 text-center">Belum ada transaksi.</p>`; return; }
        let html = '';
        snapshot.forEach(doc => {
            const order = doc.data(); const date = order.createdAt.toDate().toLocaleDateString('id-ID');
            let buttonsHTML = '';
            if(order.status === 'menunggu_pembayaran'){ buttonsHTML = `<button class="btn-confirm bg-blue-600 hover:bg-blue-700 text-white font-bold py-1 px-3 rounded-full text-xs" data-id="${doc.id}">Konfirmasi</button><button class="btn-reject-order bg-red-600 hover:bg-red-700 text-white font-bold py-1 px-3 rounded-full text-xs" data-id="${doc.id}">Tolak</button>`; }
            else if(order.status === 'dikonfirmasi'){ buttonsHTML = `<button class="btn-complete bg-green-600 hover:bg-green-700 text-white font-bold py-1 px-3 rounded-full text-xs" data-id="${doc.id}">Selesaikan</button>`; }
            const statusClass = order.status === 'selesai' ? 'bg-green-500/20 text-green-400' : order.status === 'dikonfirmasi' ? 'bg-blue-500/20 text-blue-400' : order.status === 'gagal' ? 'bg-red-500/20 text-red-400' : 'bg-yellow-500/20 text-yellow-400';
            html += `<div class="bg-gray-800 p-4 rounded-xl border border-gray-700"><div class="flex justify-between items-center"><div><p class="font-bold text-white">${order.packageName} - ${order.userName}</p><p class="text-sm text-gray-400">Billing: ****${order.billingId} | Admin: ${order.adminName}</p></div><div class="text-right"><p class="text-sm font-semibold px-3 py-1 rounded-full ${statusClass}">${order.status}</p><p class="text-xs text-gray-500 mt-1">${date}</p></div></div><div class="mt-4 pt-4 border-t border-gray-700 flex justify-end gap-2">${buttonsHTML}</div></div>`;
        });
        transactionsListContainer.innerHTML = html;
    };
    const loadTransactions = () => {
        if (!loggedInAdminName) { transactionsListContainer.innerHTML = `<p class="text-yellow-400 text-center">Tidak dapat memuat transaksi. Pastikan akun admin Anda punya field 'adminName'.</p>`; return; }
        const q = query(collection(db, 'orders'), where('adminName', '==', loggedInAdminName), orderBy('createdAt', 'desc'));
        onSnapshot(q, renderTransactions, (err)=>{ console.error(err); showToast('error', 'Gagal memuat transaksi.'); });
    };
    if(transactionsListContainer){
        transactionsListContainer.addEventListener('click', async (e) => {
            const docId = e.target.dataset.id; if(!docId) return;
            e.target.disabled = true;
            if(e.target.matches('.btn-confirm')){ await updateDoc(doc(db, 'orders', docId), { status: 'dikonfirmasi' }); showToast('success', 'Pesanan dikonfirmasi.'); }
            if(e.target.matches('.btn-complete')){ await updateDoc(doc(db, 'orders', docId), { status: 'selesai' }); showToast('success', 'Pesanan diselesaikan.'); }
            if(e.target.matches('.btn-reject-order')){ await updateDoc(doc(db, 'orders', docId), { status: 'gagal' }); showToast('info', 'Pesanan ditolak/gagal.'); }
            e.target.disabled = false;
        });
    }
    const resetGtaForm = () => { if (!gtaForm) return; gtaForm.reset(); gtaAccountId.value = ''; gtaFormTitle.textContent = 'Tambah Akun Baru'; gtaCancelBtn.classList.add('hidden'); };
    const renderGtaAccounts = (snapshot) => {
        if (!gtaAccountsList) return;
        if (snapshot.empty) { gtaAccountsList.innerHTML = `<p class="text-gray-400 text-center">Belum ada akun yang ditambahkan.</p>`; return; }
        let html = '';
        snapshot.forEach(doc => {
            const account = doc.data();
            html += `<div class="bg-gray-900 p-4 rounded-xl flex justify-between items-center"><div><p class="font-bold text-white">${account.title}</p><p class="text-sm text-blue-400">Rp ${Number(account.price).toLocaleString('id-ID')}</p></div><div class="flex gap-2"><button class="btn-gta-edit bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-1 px-3 rounded-full text-xs" data-id="${doc.id}">Edit</button><button class="btn-gta-delete bg-red-600 hover:bg-red-700 text-white font-bold py-1 px-3 rounded-full text-xs" data-id="${doc.id}">Hapus</button></div></div>`;
        });
        gtaAccountsList.innerHTML = html;
    };
    const loadGtaAccounts = () => { onSnapshot(query(collection(db, 'gta_accounts'), orderBy('price')), renderGtaAccounts, (err) => { console.error(err); showToast('error', 'Gagal memuat akun GTA.'); }); };
    if (gtaForm) {
        gtaForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const id = gtaAccountId.value;
            const accountData = { title: gtaTitleInput.value, price: Number(gtaPriceInput.value), features: gtaFeaturesInput.value.split(',').map(item => item.trim()) };
            try {
                if (id) { await updateDoc(doc(db, 'gta_accounts', id), accountData); showToast('success', 'Akun berhasil diperbarui.'); } 
                else { await addDoc(collection(db, 'gta_accounts'), accountData); showToast('success', 'Akun baru berhasil ditambahkan.'); }
                resetGtaForm();
            } catch(error) { showToast('error', 'Gagal menyimpan data.'); }
        });
    }
    if (gtaAccountsList) {
        gtaAccountsList.addEventListener('click', async (e) => {
            const target = e.target;
            const id = target.dataset.id;
            if (target.matches('.btn-gta-edit')) {
                const docSnap = await getDoc(doc(db, 'gta_accounts', id));
                if (docSnap.exists()) {
                    const data = docSnap.data();
                    gtaAccountId.value = id; gtaTitleInput.value = data.title;
                    gtaPriceInput.value = data.price; gtaFeaturesInput.value = data.features.join(', ');
                    gtaFormTitle.textContent = 'Edit Akun';
                    gtaCancelBtn.classList.remove('hidden'); window.scrollTo(0, 0);
                }
            }
            if (target.matches('.btn-gta-delete')) {
                if (confirm('Anda yakin ingin menghapus akun ini?')) {
                    try { await deleteDoc(doc(db, 'gta_accounts', id)); showToast('info', 'Akun telah dihapus.'); } 
                    catch(error) { showToast('error', 'Gagal menghapus akun.'); }
                }
            }
        });
    }
    if (gtaCancelBtn) gtaCancelBtn.addEventListener('click', resetGtaForm);
}

// --- KODE UMUM ---
const loadingOverlay = document.getElementById('loading-overlay');
if(loadingOverlay) {
    window.addEventListener('load', () => { 
        loadingOverlay.style.opacity = '0'; 
        setTimeout(() => { loadingOverlay.style.display = 'none'; }, 500); 
    }); 
}
const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
if (mobileMenuToggle) {
    const mobileMenu = document.getElementById('mobile-menu');
    mobileMenuToggle.addEventListener('click', () => mobileMenu.classList.toggle('hidden'));
}
const fadeInSections = document.querySelectorAll('.fade-in-section');
if (fadeInSections.length > 0) {
    const sectionObserver = new IntersectionObserver((entries, observer) => { entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add('is-visible'); observer.unobserve(entry.target); } }); }, { rootMargin: '0px 0px -50px 0px' });
    fadeInSections.forEach(section => sectionObserver.observe(section));
}

// --- LOGIKA BARU UNTUK HALAMAN RUANG CHAT ---
else if (window.location.pathname.endsWith('ruang-chat.html')) {
    const chatBody = document.getElementById('chat-body');
    const chatInput = document.getElementById('chat-input');
    const sendButton = document.getElementById('send-button');
    const chatLinkButton = document.getElementById('chat-link-button');

    localStorage.setItem('lastChatVisit', Date.now());
    if (chatLinkButton) {
        chatLinkButton.classList.remove('has-notification');
    }

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
            <p class="text-xs font-bold mb-1 text-blue-300">${senderName}</p>
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
    
    const q = query(collection(db, "live_chat"), orderBy("createdAt", "desc"), limit(50));
    // Listener Real-time
    const q = query(collection(db, "live_chat"), orderBy("createdAt", "desc"), limit(50));
    onSnapshot(q, (querySnapshot) => {
        if (!chatBody) return;
        chatBody.innerHTML = '';
        const messages = [];
        querySnapshot.forEach((doc) => {
            messages.push(doc.data());
        });
        // Balik urutan array agar pesan terlama di atas
        messages.reverse().forEach(msg => {
            addChatMessage(msg);
        });
    });
}
