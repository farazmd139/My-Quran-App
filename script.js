// --- Global Variables & API Key ---
const GEMINI_API_KEY = 'AIzaSyDB4TUj3zsU90jCfI8L0yivvWIYipUtq3c';

// --- DOM Elements ---
const quranListPage = document.getElementById('quranListPage');
const surahDetailPage = document.getElementById('surahDetailPage');
const surahList = document.getElementById('surah-list');
const surahHeader = document.getElementById('surahHeader');
const surahContainer = document.getElementById('surahContainer');
const mainAudioPlayer = document.getElementById('mainAudioPlayer');
const playPauseBtn = document.querySelector('.play-pause-btn');
const playIcon = document.querySelector('.play-icon');
const pauseIcon = document.querySelector('.pause-icon');
const progressContainer = document.querySelector('.progress-container');
const progressBar = document.querySelector('.progress-bar');
const timeDisplay = document.querySelector('.time-display');
const aiFab = document.getElementById('ai-fab');
const aiChatModal = document.getElementById('ai-chat-modal');
const closeChatButton = aiChatModal.querySelector('.close-button');
const chatMessages = document.getElementById('chat-messages');
const chatInput = document.getElementById('chat-input');
const sendChatButton = document.getElementById('send-chat-button');

// --- Page Navigation ---
function showPage(pageId) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById(pageId).classList.add('active');
    if (pageId === 'quranListPage') {
        mainAudioPlayer.pause();
        mainAudioPlayer.src = '';
    }
}

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

        versesData.verses.forEach((ayah, index) => {
            const box = document.createElement('div');
            box.className = 'ayah-box';
            box.innerHTML = `<p class="ayah-text">${ayah.text_uthmani}<span class="ayah-number">${index + 1}</span></p>`;
            surahContainer.appendChild(box);
        });

    } catch (error) {
        surahHeader.innerHTML = '<h1>سورہ لوڈ کرنے میں ناکامی</h1>';
    }
}

// --- Custom Audio Player Logic ---
function togglePlay() {
    if (mainAudioPlayer.src && mainAudioPlayer.src !== window.location.href) {
        if (mainAudioPlayer.paused) {
            mainAudioPlayer.play();
            playIcon.style.display = 'none';
            pauseIcon.style.display = 'block';
        } else {
            mainAudioPlayer.pause();
            playIcon.style.display = 'block';
            pauseIcon.style.display = 'none';
        }
    }
}

function formatTime(time) {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

mainAudioPlayer.addEventListener('timeupdate', () => {
    const progress = (mainAudioPlayer.currentTime / mainAudioPlayer.duration) * 100 || 0;
    progressBar.style.width = `${progress}%`;
    timeDisplay.textContent = `${formatTime(mainAudioPlayer.currentTime)} / ${formatTime(mainAudioPlayer.duration || 0)}`;
});

mainAudioPlayer.addEventListener('loadedmetadata', () => {
    timeDisplay.textContent = `${formatTime(0)} / ${formatTime(mainAudioPlayer.duration)}`;
});

mainAudioPlayer.addEventListener('ended', () => {
    playIcon.style.display = 'block';
    pauseIcon.style.display = 'none';
});

playPauseBtn.addEventListener('click', togglePlay);

progressContainer.addEventListener('click', (e) => {
    if (mainAudioPlayer.duration) {
        const width = progressContainer.clientWidth;
        const clickX = e.offsetX;
        mainAudioPlayer.currentTime = (clickX / width) * mainAudioPlayer.duration;
    }
});

// --- Floating Action Buttons & Modal Logic ---
aiFab.addEventListener('click', () => {
    aiChatModal.style.display = 'flex';
});

closeChatButton.addEventListener('click', () => {
    aiChatModal.style.display = 'none';
});

document.getElementById('home-fab').addEventListener('click', () => {
    showPage('quranListPage');
});

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

function addMessageToChat(message, sender) {
    const messageElement = document.createElement('div');
    messageElement.classList.add('message', sender === 'user' ? 'user-message' : 'ai-message');
    messageElement.innerText = message;
    chatMessages.appendChild(messageElement);
    chatMessages.scrollTop = chatMessages.scrollHeight;
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

// --- Initial Load ---
document.addEventListener('DOMContentLoaded', () => {
    fetchSurahList();
});
