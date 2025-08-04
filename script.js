// --- Global Variables & API Key ---
const GEMINI_API_KEY = 'AIzaSyDB4TUj3zsU90jCfI8L0yivvWIYipUtq3c';

// --- DOM Elements ---
const pages = document.querySelectorAll('.page');
const navButtons = document.querySelectorAll('.nav-button');
const surahList = document.getElementById('surah-list');
const surahHeader = document.getElementById('surahHeader');
const surahContainer = document.getElementById('surahContainer');
const mainAudioPlayer = document.getElementById('mainAudioPlayer');
const menuButton = document.getElementById('menu-button');
const sideMenu = document.getElementById('side-menu');
const menuOverlay = document.getElementById('menu-overlay');
const headerTitle = document.getElementById('header-title');
const chatMessages = document.getElementById('chat-messages');
const chatInput = document.getElementById('chat-input');
const sendChatButton = document.getElementById('send-chat-button');
const tasbihCounter = document.getElementById('tasbih-counter');
const tasbihBead = document.getElementById('tasbih-bead');
const resetButton = document.getElementById('reset-button');
const tasbihSelect = document.getElementById('tasbih-select');
const targetDisplay = document.getElementById('target-display');
const duaCategoriesContainer = document.getElementById('dua-categories');
const duaListContainer = document.getElementById('dua-list');
const namesContainer = document.getElementById('names-container');
const showNamesBtn = document.getElementById('show-names-btn');
const prayerTimeContainer = document.getElementById('prayer-times-container');
const dailyAyahContainer = document.getElementById('daily-ayah-container');
const prayerTimeLoader = document.getElementById('prayer-time-loader');

// --- Navigation & Side Menu Logic ---
navButtons.forEach(button => {
    button.addEventListener('click', (e) => {
        e.preventDefault();
        const pageId = button.dataset.page;
        showPage(pageId);
    });
});

function showPage(pageId) {
    pages.forEach(page => page.classList.remove('active'));
    const activePage = document.getElementById(pageId);
    if (activePage) {
        activePage.classList.add('active');
        const pageTitles = {
            quranPage: "القرآن الكريم",
            aiPage: "Faraz AI اسسٹنٹ",
            homeCustomPage: "ہوم",
            tasbihPage: "ڈیجیٹل تسبیح",
            duaPage: "دعائیں اور اذکار",
            surahDetailPage: "القرآن الكريم"
        };
        headerTitle.textContent = pageTitles[pageId] || "القرآن الكريم";
        
        // Show/Hide Floating Menu Button
        if (pageId === 'homeCustomPage') {
            menuButton.classList.add('visible');
        } else {
            menuButton.classList.remove('visible');
        }
    }
    if (pageId !== 'surahDetailPage') {
        mainAudioPlayer.pause();
        mainAudioPlayer.src = '';
    }
}

menuButton.addEventListener('click', () => {
    sideMenu.classList.toggle('open');
    menuOverlay.classList.toggle('open');
});
menuOverlay.addEventListener('click', () => {
    sideMenu.classList.remove('open');
    menuOverlay.classList.remove('open');
});

// --- Quran Functionality ---
async function fetchSurahList() {
    try {
        const response = await fetch('https://api.quran.com/api/v4/chapters');
        const data = await response.json();
        displaySurahs(data.chapters);
    } catch (error) {
        surahList.innerHTML = '<p style="color: white; text-align: center;">سورہ کی فہرست لوڈ کرنے میں ناکامی۔</p>';
    }
}

function displaySurahs(surahs) {
    surahList.innerHTML = '';
    surahs.forEach(surah => {
        const listItem = document.createElement('li');
        listItem.className = 'surah-list-item';
        listItem.innerHTML = `
            <div class="surah-info">
                <span class="surah-number">${surah.id}</span>
                <div class="surah-name-details">
                    <h3>${surah.name_simple}</h3>
                    <p>${surah.translated_name.name} - ${surah.verses_count} آیات</p>
                </div>
            </div>
            <span class="surah-arabic-name">${surah.name_arabic}</span>
        `;
        listItem.addEventListener('click', () => loadSurah(surah.id));
        surahList.appendChild(listItem);
    });
}

async function loadSurah(surahId) {
    showPage('surahDetailPage');
    surahHeader.innerHTML = '<h1>لوڈ ہو رہا ہے...</h1>';
    surahContainer.innerHTML = '';
    
    try {
        const [versesRes, infoRes, audioRes] = await Promise.all([
            fetch(`https://api.quran.com/api/v4/quran/verses/uthmani?chapter_number=${surahId}`),
            fetch(`https://api.quran.com/api/v4/chapters/${surahId}`),
            fetch(`https://api.quran.com/api/v4/chapter_recitations/7/${surahId}`)
        ]);

        const versesData = await versesRes.json();
        const infoData = await infoRes.json();
        const audioData = await audioRes.json();

        const surahInfo = infoData.chapter;
        surahHeader.innerHTML = `${surahInfo.bismillah_pre ? '<h1>بِسْمِ اللّٰهِ الرَّحْمٰنِ الرَّحِيْمِ</h1>' : ''}<h1>${surahInfo.name_arabic}</h1>`;
        
        mainAudioPlayer.src = audioData.audio_file.audio_url;
        mainAudioPlayer.play().catch(e => console.log("Autoplay prevented."));

        versesData.verses.forEach((ayah, index) => {
            const box = document.createElement('div');
            box.className = 'ayah-box';
            box.innerHTML = `<p class="ayah-text">${ayah.text_uthmani}<span class="ayah-number">${index + 1}</span></p>`;
            box.style.animationDelay = `-${index * 1.5}s`;
            surahContainer.appendChild(box);
        });

    } catch (error) {
        surahHeader.innerHTML = '<h1>سورہ لوڈ کرنے میں ناکامی</h1>';
    }
}

// --- AI Chat Functionality ---
chatInput.addEventListener('keypress', (event) => { if (event.key === 'Enter') sendMessage(); });
sendChatButton.addEventListener('click', sendMessage);

function sendMessage() {
    const question = chatInput.value.trim();
    if (question === '') return;
    addMessageToChat(question, 'user');
    chatInput.value = '';
    askGoogleAI(question);
}

function addMessageToChat(message, sender, isTyping = false) {
    const messageElement = document.createElement('div');
    messageElement.classList.add('message', sender === 'user' ? 'user-message' : 'ai-message');
    if (isTyping) {
        messageElement.innerHTML = `<div class="typing-indicator"><span></span><span></span><span></span></div>`;
    } else {
        messageElement.innerText = message;
    }
    chatMessages.appendChild(messageElement);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    return messageElement;
}

async function askGoogleAI(question) {
    const typingMessage = addMessageToChat('', 'ai', true);
    const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${GEMINI_API_KEY}`;
    const requestData = {
        contents: [{ parts: [{ text: `You are "Faraz," a learned Islamic scholar AI assistant. Your knowledge is based on Quran, Tafsir, and Hadith. Answer questions in the same language the user asks (Urdu, Hindi, or English). Cite sources if possible. User's question: "${question}"` }] }]
    };

    try {
        const response = await fetch(API_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(requestData) });
        if (!response.ok) { throw new Error('Network response was not ok'); }
        const data = await response.json();
        const aiResponse = data.candidates[0].content.parts[0].text;
        typingMessage.innerHTML = '';
        typingMessage.innerText = aiResponse;
    } catch (error) {
        typingMessage.innerText = "معافی चाहता हूं, अभी मैं जवाब नहीं दे सकता।";
    }
}

// --- Tasbih Functionality ---
let count = 0;
const tasbihat = [
    { name: "سُبْحَانَ اللَّهِ", target: 33 }, { name: "الْحَمْدُ لِلَّهِ", target: 33 },
    { name: "اللَّهُ أَكْبَرُ", target: 34 }, { name: "أَسْتَغْفِرُ اللَّهَ", target: 100 },
    { name: "لَا إِلَهَ إِلَّا اللَّهُ", target: 100 }, { name: "لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ", target: 100 },
    { name: "سُبْحَانَ اللَّهِ وَبِحَمْدِهِ", target: 100 }, { name: "سُبْحَانَ اللَّهِ الْعَظِيمِ", target: 100 },
    { name: "اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ", target: 100 }, { name: "حَسْبِيَ اللَّهُ لَا إِلَهَ إِلَّا هُوَ", target: 100 }
];

tasbihat.forEach(tasbih => {
    const option = document.createElement('option');
    option.value = tasbih.target;
    option.textContent = tasbih.name;
    tasbihSelect.appendChild(option);
});

function updateTarget() {
    targetDisplay.textContent = `/ ${tasbihSelect.value}`;
}

tasbihSelect.addEventListener('change', () => {
    count = 0;
    tasbihCounter.innerText = count;
    updateTarget();
});

tasbihBead.addEventListener('click', () => {
    count++;
    tasbihCounter.innerText = count;
    if (navigator.vibrate) { navigator.vibrate(50); }
    if (count == tasbihSelect.value) {
        if (navigator.vibrate) { navigator.vibrate([100, 50, 100]); }
    }
});

resetButton.addEventListener('click', () => {
    count = 0;
    tasbihCounter.innerText = count;
    if (navigator.vibrate) { navigator.vibrate(100); }
});

// --- Dua, Kalma, Hadith & 99 Names Data & Functionality ---
// This will be added in a future update as it requires a lot of data.

// --- Home Page Functionality ---
const dailyAyahs = [
    { arabic: "فَبِأَيِّ آلَاءِ رَبِّكُمَا تُكَذِّبَانِ", translation: "پس تم अपने रब की कौन-कौन सी نعمتوں को جھٹلاؤ گے؟" },
    { arabic: "إِنَّ مَعَ الْعُسْرِ يُسْرًا", translation: "بے شک हर मुश्किल के साथ آسانی ہے۔" },
    { arabic: "وَمَنْ يَتَوَكَّلْ عَلَى اللَّهِ فَهُوَ حَسْبُهُ", translation: "और जो अल्लाह पर بھروسہ करता है, तो वह उसके लिए کافی ہے۔" }
];

async function getPrayerTimes(latitude, longitude) {
    try {
        const date = new Date();
        const formattedDate = `${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}`;
        const response = await fetch(`https://api.aladhan.com/v1/timings/${formattedDate}?latitude=${latitude}&longitude=${longitude}&method=2`);
        const data = await response.json();
        displayPrayerTimes(data.data.timings);
    } catch (error) {
        prayerTimeLoader.textContent = "نماز کے اوقات حاصل کرنے میں ناکامی۔";
    }
}

function displayPrayerTimes(timings) {
    prayerTimeLoader.style.display = 'none';
    const requiredTimings = { 'Fajr': 'فجر', 'Dhuhr': 'ظہر', 'Asr': 'عصر', 'Maghrib': 'مغرب', 'Isha': 'عشاء' };
    prayerTimeContainer.innerHTML = '';
    for (const [key, value] of Object.entries(requiredTimings)) {
        const prayerDiv = document.createElement('div');
        prayerDiv.className = 'prayer-time';
        prayerDiv.innerHTML = `<p>${value}</p><p class="time">${timings[key]}</p>`;
        prayerTimeContainer.appendChild(prayerDiv);
    }
}

function showRandomAyah() {
    const randomIndex = Math.floor(Math.random() * dailyAyahs.length);
    const ayah = dailyAyahs[randomIndex];
    dailyAyahContainer.innerHTML = `<p class="ayah-arabic">${ayah.arabic}</p><p class="ayah-translation">${ayah.translation}</p>`;
}


// --- Modal & Menu Links ---
function openModal(modalId) {
    closeAllModals();
    document.getElementById(modalId).style.display = 'flex';
}
function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}
function closeAllModals() {
    document.querySelectorAll('.modal').forEach(modal => modal.style.display = 'none');
}

document.getElementById('rate-app-link').addEventListener('click', (e) => { e.preventDefault(); window.open('https://play.google.com/store/apps/details?id=com.faraz.quranapp', '_blank'); });
document.getElementById('share-app-link').addEventListener('click', (e) => { e.preventDefault(); const shareData = { title: 'القرآن الكريم - Faraz AI', text: 'कुरान पढ़ें, सुनें और AI असिस्टेंट "फराज" से इस्लामी सवाल पूछें। इस खूबसूरत ऐप को डाउनलोड करें!', url: 'https://play.google.com/store/apps/details?id=com.faraz.quranapp' }; if (navigator.share) { navigator.share(shareData).catch(console.error); } else { alert(shareData.text + "\n" + shareData.url); } });
showNamesBtn.addEventListener('click', () => openModal('names-modal'));
document.getElementById('show-names-btn-more')?.addEventListener('click', () => openModal('names-modal'));

// --- Initial Load ---
document.addEventListener('DOMContentLoaded', () => {
    navigate();
    fetchSurahList();
    updateTarget();
    // loadDuaContent(); // This will be added in the final version
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(position => {
            getPrayerTimes(position.coords.latitude, position.coords.longitude);
        }, () => { prayerTimeLoader.textContent = "لوکیشن کی اجازت درکار ہے۔"; });
    } else {
        prayerTimeLoader.textContent = "آپ کا براؤزر لوکیشن کو سپورٹ نہیں کرتا۔";
    }
    showRandomAyah();
    setInterval(showRandomAyah, 600000);
});

// Service Worker Registration
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').then(reg => console.log('SW registered.')).catch(err => console.log('SW registration failed:', err));
    });
}
