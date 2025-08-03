// Your API Key
const GEMINI_API_KEY = 'AIzaSyDB4TUj3zsU90jCfI8L0yivvWIYipUtq3c';

// --- DOM Elements ---
const pages = document.querySelectorAll('.page');
const surahList = document.getElementById('surah-list');
const surahHeader = document.getElementById('surahHeader');
const surahContainer = document.getElementById('surahContainer');
const mainAudioPlayer = document.getElementById('mainAudioPlayer');

// --- Page Navigation ---
function showPage(pageId) {
    pages.forEach(page => page.classList.remove('active'));
    const newPage = document.getElementById(pageId);
    if (newPage) {
        newPage.classList.add('active');
    }
    if (pageId === 'homePage') {
        mainAudioPlayer.pause();
        mainAudioPlayer.src = '';
    }
}

// --- Fetch and Display Surah List ---
async function fetchSurahList() {
    try {
        const response = await fetch('https://api.quran.com/api/v4/chapters');
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();
        displaySurahs(data.chapters);
    } catch (error) {
        surahList.innerHTML = '<p style="color: white; text-align: center;">سورہ کی فہرست لوڈ کرنے میں ناکامی।</p>';
        console.error("Error fetching surah list:", error);
    }
}

function displaySurahs(surahs) {
    surahList.innerHTML = '';
    surahs.forEach(surah => {
        const listItem = document.createElement('li');
        listItem.className = 'surah-list-item';
        listItem.dataset.surahId = surah.id;
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

// --- Load and Display a Single Surah ---
async function loadSurah(surahId) {
    showPage('surahPage');
    surahHeader.innerHTML = '<h1>لوڈ ہو رہا ہے...</h1>';
    surahContainer.innerHTML = '';
    
    try {
        const [versesRes, infoRes, audioRes] = await Promise.all([
            fetch(`https://api.quran.com/api/v4/quran/verses/uthmani?chapter_number=${surahId}`),
            fetch(`https://api.quran.com/api/v4/chapters/${surahId}`),
            fetch(`https://api.quran.com/api/v4/chapter_recitations/7/${surahId}`)
        ]);

        if (!versesRes.ok || !infoRes.ok || !audioRes.ok) throw new Error('Failed to fetch surah data');

        const versesData = await versesRes.json();
        const infoData = await infoRes.json();
        const audioData = await audioRes.json();

        const surahInfo = infoData.chapter;
        surahHeader.innerHTML = `
            ${surahInfo.bismillah_pre ? '<h1>بِسْمِ اللّٰهِ الرَّحْمٰنِ الرَّحِيْمِ</h1>' : ''}
            <h1>${surahInfo.name_arabic}</h1>
        `;
        
        mainAudioPlayer.src = audioData.audio_file.audio_url;

        versesData.verses.forEach((ayah, index) => {
            const box = document.createElement('div');
            box.className = 'ayah-box';
            box.innerHTML = `<p class="ayah-text">${ayah.text_uthmani}<span class="ayah-number">${index + 1}</span></p>`;
            box.style.animationDelay = `-${index * 1.5}s`;
            surahContainer.appendChild(box);
        });

    } catch (error) {
        surahHeader.innerHTML = '<h1>سورہ لوڈ کرنے میں ناکامی</h1>';
        console.error("Error loading surah:", error);
    }
}

// --- AI Chat ---
const chatButton = document.getElementById('ai-chat-button');
const chatModal = document.getElementById('ai-chat-modal');
const closeChatButton = document.getElementById('close-chat-button');
const chatMessages = document.getElementById('chat-messages');
const chatInput = document.getElementById('chat-input');
const sendChatButton = document.getElementById('send-chat-button');

chatButton.addEventListener('click', () => openModal('ai-chat-modal'));
closeChatButton.addEventListener('click', () => closeModal('ai-chat-modal'));
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
        contents: [{
            parts: [{
                text: `You are "Faraz," a learned Islamic scholar AI assistant. Your knowledge is based on the Quran, Tafsir (like Ibn Kathir, At-Tabari), and authentic Hadith collections (Sahih al-Bukhari, Sahih Muslim, Jami' at-Tirmidhi, etc.). When a user asks a question, provide a detailed, accurate, and respectful answer in the same language they used (Urdu, Hindi, or English). If possible, cite your sources (e.g., Quran 2:183, Sahih al-Bukhari 5678). Be comprehensive but easy to understand. User's question: "${question}"`
            }]
        }]
    };

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestData)
        });
        if (!response.ok) { throw new Error('Network response was not ok'); }
        const data = await response.json();
        const aiResponse = data.candidates[0].content.parts[0].text;
        typingMessage.innerHTML = '';
        typingMessage.innerText = aiResponse;
    } catch (error) {
        console.error("AI Error:", error);
        typingMessage.innerText = "معافی चाहता हूं, अभी मैं जवाब नहीं दे सकता।";
    }
}

// --- Modal Control & Extra Features ---
const settingsIcon = document.getElementById('settings-icon');
const aiTutorButton = document.getElementById('ai-tutor-button');
const rateAppLink = document.getElementById('rate-app-link');
const shareAppLink = document.getElementById('share-app-link');

function openModal(modalId) {
    closeAllModals();
    const modal = document.getElementById(modalId);
    if(modal) modal.style.display = 'flex';
}
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if(modal) modal.style.display = 'none';
}
function closeAllModals() {
    document.querySelectorAll('.modal').forEach(modal => modal.style.display = 'none');
}

settingsIcon.addEventListener('click', () => openModal('settings-modal'));
aiTutorButton.addEventListener('click', () => openModal('coming-soon-modal'));
window.addEventListener('click', (event) => { if (event.target.classList.contains('modal')) { closeAllModals(); } });

shareAppLink.addEventListener('click', (e) => {
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

rateAppLink.addEventListener('click', (e) => {
    e.preventDefault();
    window.open('https://play.google.com/store/apps/details?id=com.faraz.quranapp', '_blank');
});

// --- Initial Load ---
document.addEventListener('DOMContentLoaded', () => {
    fetchSurahList();
});

// --- Service Worker Registration ---
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('ServiceWorker registration successful with scope: ', registration.scope);
            })
            .catch(err => {
                console.log('ServiceWorker registration failed: ', err);
            });
    });
}