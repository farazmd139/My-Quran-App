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

// --- Navigation Logic ---
navButtons.forEach(button => {
    button.addEventListener('click', () => {
        const pageId = button.dataset.page;
        showPage(pageId);
        
        navButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
    });
});

function showPage(pageId) {
    pages.forEach(page => {
        page.classList.remove('active');
    });
    const activePage = document.getElementById(pageId);
    if(activePage) {
        activePage.classList.add('active');
    }
    
    if(pageId !== 'surahDetailPage') {
        mainAudioPlayer.pause();
        mainAudioPlayer.src = '';
    }
}

// --- Side Menu Logic ---
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
const chatMessages = document.getElementById('chat-messages');
const chatInput = document.getElementById('chat-input');
const sendChatButton = document.getElementById('send-chat-button');

chatInput.addEventListener('keypress', (event) => { if (event.key === 'Enter') sendMessage(); });
sendChatButton.addEventListener('click', sendMessage);

function sendMessage() {
    const question = chatInput.value.trim();
    if (question === '') return;
    addMessageToChat(question, 'user');
    chatInput.value = '';
    askGoogleAI(question);
}

function addMessageToChat(message, sender) {
    const messageElement = document.createElement('div');
    messageElement.classList.add('message', sender === 'user' ? 'user-message' : 'ai-message');
    messageElement.innerText = message;
    chatMessages.appendChild(messageElement);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    return messageElement;
}

async function askGoogleAI(question) {
    addMessageToChat('سوچ رہا ہوں...', 'ai');
    const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${GEMINI_API_KEY}`;
    const requestData = {
        contents: [{ parts: [{ text: `You are "Faraz," a learned Islamic scholar AI assistant. Your knowledge is based on Quran, Tafsir, and Hadith. Answer questions in the same language the user asks (Urdu, Hindi, or English). Cite sources if possible. User's question: "${question}"` }] }]
    };

    try {
        const response = await fetch(API_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(requestData) });
        if (!response.ok) { throw new Error('Network response was not ok'); }
        const data = await response.json();
        const aiResponse = data.candidates[0].content.parts[0].text;
        chatMessages.lastChild.innerText = aiResponse;
    } catch (error) {
        chatMessages.lastChild.innerText = "معافی चाहता हूं, अभी मैं जवाब नहीं दे सकता।";
    }
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

document.getElementById('rate-app-link').addEventListener('click', (e) => {
    e.preventDefault();
    window.open('https://play.google.com/store/apps/details?id=com.faraz.quranapp', '_blank');
});

document.getElementById('share-app-link').addEventListener('click', (e) => {
    e.preventDefault();
    const shareData = {
        title: 'القرآن الكريم - Faraz AI',
        text: 'कुरान पढ़ें, सुनें और AI असिस्टेंट "फराज" से इस्लामी सवाल पूछें। इस खूबसूरत ऐप को डाउनलोड करें!',
        url: 'https://play.google.com/store/apps/details?id=com.faraz.quranapp'
    };
    if (navigator.share) {
        navigator.share(shareData).catch(console.error);
    } else {
        alert(shareData.text + "\n" + shareData.url);
    }
});

// --- Initial Load ---
document.addEventListener('DOMContentLoaded', () => {
    fetchSurahList();
    showPage('quranPage'); // Start on the Quran page
});

// Service Worker Registration
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(reg => console.log('Service worker registered.', reg))
            .catch(err => console.log('Service worker registration failed:', err));
    });
}
