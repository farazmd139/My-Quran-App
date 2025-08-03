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
    }
    if (pageId !== 'surahDetailPage') {
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
const tasbihCounter = document.getElementById('tasbih-counter');
const tasbihBead = document.getElementById('tasbih-bead');
const resetButton = document.getElementById('reset-button');
const tasbihSelect = document.getElementById('tasbih-select');
const targetDisplay = document.getElementById('target-display');
let count = 0;

const tasbihat = [
    { name: "سُبْحَانَ اللَّهِ", target: 33 },
    { name: "الْحَمْدُ لِلَّهِ", target: 33 },
    { name: "اللَّهُ أَكْبَرُ", target: 34 },
    { name: "لَا إِلَهَ إِلَّا اللَّهُ", target: 100 },
    { name: "أَسْتَغْفِرُ اللَّهَ", target: 100 },
    { name: "لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ", target: 100 },
    { name: "سُبْحَانَ اللَّهِ وَبِحَمْدِهِ", target: 100 },
    { name: "سُبْحَانَ اللَّهِ الْعَظِيمِ", target: 100 },
    { name: "اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ", target: 100 },
    { name: "حَسْبِيَ اللَّهُ لَا إِلَهَ إِلَّا هُوَ", target: 100 }
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

// --- Dua & 99 Names Functionality ---
const duaCategoriesContainer = document.getElementById('dua-categories');
const duaListContainer = document.getElementById('dua-list');
const namesContainer = document.getElementById('names-container');
const showNamesBtn = document.getElementById('show-names-btn');
const showNamesBtnMore = document.getElementById('show-names-btn-more');

let allContent = [];

// Data for Duas, Kalmas, Hadiths
async function loadContentData() {
    allContent = [
        // Your 50 Duas
        { category: "دعائیں", arabic: "اَللّٰھُمَّ اِنِّیْ اَسْئَلُکَ الْعَفْوَ وَالْعَافِیَةَ فِی الدُّنْیَا وَالْآخِرَةِ", translation: "اے اللہ! میں تجھ سے دنیا اور آخرت میں معافی اور عافیت مانگتا ہوں۔" },
        { category: "دعائیں", arabic: "رَبَّنَا آتِنَا فِی الدُّنْیَا حَسَنَةً وَّفِی الْآخِرَةِ حَسَنَةً وَّقِنَا عَذَابَ النَّارِ", translation: "اے ہمارے رب! ہمیں دنیا میں بھلائی عطا فرما اور آخرت میں بھلائی عطا فرما اور ہمیں آگ کے عذاب سے بچا۔" },
        // ... (All 50 duas go here)

        // Your 6 Kalmas
        { category: "کلمے", arabic: "لَا إِلَهَ إِلَّا اللَّهُ مُحَمَّدٌ رَسُولُ اللَّهِ", translation: "کوئی معبود نہیں سوائے اللہ کے، محمد صلی اللہ علیہ وسلم اللہ کے رسول ہیں۔" },
        // ... (All 6 kalmas go here)

        // Your 40 Hadiths
        { category: "احادیث", arabic: "إِنَّمَا الأَعْمَالُ بِالنِّيَّاتِ", translation: "اعمال کا دارومدار نیتوں پر ہے۔ (صحیح بخاری: 1)" },
        // ... (All 40 hadiths go here)
    ];

    const categories = [...new Set(allContent.map(item => item.category))];
    displayDuaCategories(categories);
    filterContent(categories[0]);
}

function displayDuaCategories(categories) {
    duaCategoriesContainer.innerHTML = '';
    categories.forEach(category => {
        const button = document.createElement('button');
        button.className = 'category-button';
        button.textContent = category;
        button.addEventListener('click', () => {
            document.querySelectorAll('.category-button').forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            filterContent(category);
        });
        duaCategoriesContainer.appendChild(button);
    });
    duaCategoriesContainer.firstChild.classList.add('active');
}

function filterContent(category) {
    const items = allContent.filter(item => item.category === category);
    duaListContainer.innerHTML = '';
    items.forEach(item => {
        const card = document.createElement('div');
        card.className = 'dua-card';
        card.innerHTML = `<p class="dua-arabic">${item.arabic}</p><p class="dua-translation">${item.translation}</p>`;
        duaListContainer.appendChild(card);
    });
}

async function fetchNamesOfAllah() {
    // 99 Names Data
    const namesData = [ { "name": "الرحمن", "transliteration": "Ar-Rahman", "en": { "meaning": "The Beneficent" } }, /* ... Add all 99 names here */ ];
    displayNames(namesData);
}
function displayNames(names) {
    namesContainer.innerHTML = '';
    names.forEach(name => {
        const nameCard = document.createElement('div');
        nameCard.className = 'name-card';
        nameCard.innerHTML = `<p class="name-arabic">${name.name}</p><p class="name-translation">${name.transliteration} - ${name.en.meaning}</p>`;
        namesContainer.appendChild(nameCard);
    });
}


// --- Home Page Functionality ---
const prayerTimeContainer = document.getElementById('prayer-times-container');
const dailyAyahContainer = document.getElementById('daily-ayah-container');
const prayerTimeLoader = document.getElementById('prayer-time-loader');

async function getPrayerTimes(latitude, longitude) { /* ... (This function remains the same) ... */ }
function displayPrayerTimes(timings) { /* ... (This function remains the same) ... */ }
function showRandomAyah() { /* ... (This function remains the same) ... */ }


// --- Modal & Menu Links ---
function openModal(modalId) {
    closeAllModals();
    document.getElementById(modalId).style.display = 'flex';
    if (modalId === 'names-modal' && namesContainer.innerHTML === '') {
        fetchNamesOfAllah();
    }
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
document.getElementById('show-names-btn-more').addEventListener('click', () => openModal('names-modal'));

// --- Initial Load ---
document.addEventListener('DOMContentLoaded', () => {
    fetchSurahList();
    loadContentData();
    showPage('homeCustomPage');
    updateTarget();
    // Prayer Times and Ayah
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
