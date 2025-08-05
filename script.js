// --- Global Variables & API Keys ---
const GEMINI_API_KEY = 'YOUR_GEMINI_API_KEY'; // Replace with your Gemini API key
const GOOGLE_MAPS_API_KEY = 'YOUR_GOOGLE_MAPS_API_KEY'; // Replace with your Google Maps API key

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
const prayerTimeLoader = document.getElementById('prayer-time-loader');
const qiblaDirectionContainer = document.getElementById('qibla-direction-container');
const qiblaLoader = document.getElementById('qibla-loader');
const islamicDateContainer = document.getElementById('islamic-date-container');
const islamicDateLoader = document.getElementById('islamic-date-loader');
const duaOfTheDayContainer = document.getElementById('dua-of-the-day-container');
const dailyAyahContainer = document.getElementById('daily-ayah-container');
const aiShortcutBtn = document.getElementById('ai-shortcut-btn');
const tasbihSummaryContainer = document.getElementById('tasbih-summary-container');
const tasbihSummaryLoader = document.getElementById('tasbih-summary-loader');
const islamicEventContainer = document.getElementById('islamic-event-container');
const islamicEventLoader = document.getElementById('islamic-event-loader');
const rateAppLink = document.getElementById('rate-app-link');
const shareAppLink = document.getElementById('share-app-link');

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
    navButtons.forEach(btn => btn.classList.remove('active'));

    const activePage = document.getElementById(pageId);
    const activeButton = document.querySelector(`.nav-button[data-page="${pageId}"]`);

    if (activePage) activePage.classList.add('active');
    if (activeButton) activeButton.classList.add('active');

    if (pageId === 'homeCustomPage') {
        menuButton.classList.add('visible');
    } else {
        menuButton.classList.remove('visible');
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
        if (!response.ok) throw new Error('Network response failed');
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
                    <p>${surah.translated_name.name} - ${surah.verses_count} آیات</p>
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
        surahHeader.innerHTML = `${surahInfo.bismillah_pre ? '<h1>بِسْمِ اللّٰهِ الرَّحْمٰنِ الرَّحِيْمِ</h1>' : ''}`;

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
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();
        const aiResponse = data.candidates[0].content.parts[0].text;
        typingMessage.innerHTML = '';
        typingMessage.innerText = aiResponse;
    } catch (error) {
        typingMessage.innerHTML = '';
        typingMessage.innerText = "معافی مانگتا ہوں، ابھی جواب نہیں دے سکتا۔";
    }
}

// --- Tasbih Functionality ---
let count = 0;
const tasbihat = [
    { name: "سُبْحَانَ اللَّهِ", target: 33 },
    { name: "الْحَمْدُ لِلَّهِ", target: 33 },
    { name: "اللَّهُ أَكْبَرُ", target: 34 },
    { name: "أَسْتَغْفِرُ اللَّهَ", target: 100 },
    { name: "لَا إِلَهَ إِلَّا اللَّهُ", target: 100 },
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

// --- Home Page Functionality ---
const dailyAyahs = [
    { arabic: "فَبِأَيِّ آلَاءِ رَبِّكُمَا تُكَذِّبَانِ", translation: "پس تم اپنے رب کی کون کون سی نعمتوں کو جھٹلاؤ گے؟", reference: "سورہ الرحمن: 13" },
    { arabic: "إِنَّ مَعَ الْعُسْرِ يُسْرًا", translation: "بے شک ہر مشکل کے ساتھ آسانی ہے۔", reference: "سورہ الشرح: 6" },
    { arabic: "وَمَنْ يَتَوَكَّلْ عَلَى اللَّهِ فَهُوَ حَسْبُهُ", translation: "اور جو اللہ پر بھروسہ کرتا ہے، تو وہ اس کے لیے کافی ہے۔", reference: "سورہ الطلاق: 3" }
];

async function getCityName(latitude, longitude) {
    try {
        const response = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${GOOGLE_MAPS_API_KEY}`);
        const data = await response.json();
        if (data.status === 'OK') {
            const city = data.results.find(result => result.types.includes('locality'));
            return city ? city.formatted_address : 'نامعلوم شہر';
        }
        return 'نامعلوم شہر';
    } catch (error) {
        return 'نامعلوم شہر';
    }
}

async function getPrayerTimes(latitude, longitude) {
    try {
        const cityName = await getCityName(latitude, longitude);
        const date = new Date();
        const formattedDate = `${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}`;
        const response = await fetch(`https://api.aladhan.com/v1/timings/${formattedDate}?latitude=${latitude}&longitude=${longitude}&method=2`);
        const data = await response.json();
        if (data.code === 200) {
            displayPrayerTimes(data.data.timings, cityName);
        } else {
            prayerTimeLoader.textContent = "نماز کے اوقات حاصل کرنے میں ناکامی۔";
        }
    } catch (error) {
        prayerTimeLoader.textContent = "نماز کے اوقات حاصل کرنے میں ناکامی۔";
    }
}

function displayPrayerTimes(timings, cityName) {
    prayerTimeLoader.style.display = 'none';
    const requiredTimings = { 'Fajr': 'فجر', 'Dhuhr': 'ظہر', 'Asr': 'عصر', 'Maghrib': 'مغرب', 'Isha': 'عشاء' };
    prayerTimeContainer.innerHTML = `<p style="font-size: 1.2rem; margin-bottom: 10px;">شہر: ${cityName}</p>`;
    for (const [key, value] of Object.entries(requiredTimings)) {
        const prayerDiv = document.createElement('div');
        prayerDiv.className = 'prayer-time';
        prayerDiv.innerHTML = `<p>${value}</p><p class="time">${timings[key]}</p>`;
        prayerTimeContainer.appendChild(prayerDiv);
    }
}

async function getQiblaDirection(latitude, longitude) {
    try {
        const response = await fetch(`https://api.aladhan.com/v1/qibla/${latitude}/${longitude}`);
        const data = await response.json();
        if (data.code === 200) {
            qiblaLoader.style.display = 'none';
            qiblaDirectionContainer.innerHTML = `
                <div class="qibla-compass"></div>
                <p>قبلہ کی سمت: ${data.data.direction.toFixed(2)}°</p>
            `;
        } else {
            qiblaLoader.textContent = "قبلہ کی سمت حاصل کرنے میں ناکامی۔";
        }
    } catch (error) {
        qiblaLoader.textContent = "قبلہ کی سمت حاصل کرنے میں ناکامی۔";
    }
}

async function getIslamicDate(latitude, longitude) {
    try {
        const date = new Date();
        const formattedDate = `${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}`;
        const response = await fetch(`https://api.aladhan.com/v1/gToH/${formattedDate}`);
        const data = await response.json();
        if (data.code === 200) {
            islamicDateLoader.style.display = 'none';
            const hijri = data.data.hijri;
            islamicDateContainer.innerHTML = `<p>${hijri.day} ${hijri.month.ar} ${hijri.year} ہجری</p>`;
        } else {
            islamicDateLoader.textContent = "اسلامی تاریخ حاصل کرنے میں ناکامی۔";
        }
    } catch (error) {
        islamicDateLoader.textContent = "اسلامی تاریخ حاصل کرنے میں ناکامی۔";
    }
}

function showRandomAyah() {
    const randomIndex = Math.floor(Math.random() * dailyAyahs.length);
    const ayah = dailyAyahs[randomIndex];
    dailyAyahContainer.innerHTML = `
        <p class="ayah-arabic">${ayah.arabic}</p>
        <p class="ayah-translation">${ayah.translation}${ayah.reference ? ` (${ayah.reference})` : ''}</p>
    `;
}

function showDuaOfTheDay() {
    const duas = allContent.filter(item => item.category === "50 دعائیں");
    if (duas.length === 0) {
        duaOfTheDayContainer.innerHTML = `<p>دعائیں لوڈ کرنے میں ناکامی۔</p>`;
        return;
    }
    const randomIndex = Math.floor(Math.random() * duas.length);
    const dua = duas[randomIndex];
    duaOfTheDayContainer.innerHTML = `
        <p class="dua-arabic">${dua.arabic}</p>
        <p class="dua-translation">${dua.translation}${dua.reference ? ` (${dua.reference})` : ''}</p>
    `;
}

aiShortcutBtn.addEventListener('click', () => {
    showPage('aiPage');
});

function showTasbihSummary() {
    const lastTasbih = tasbihSelect.options[tasbihSelect.selectedIndex]?.text || "سُبْحَانَ اللَّهِ";
    const lastCount = count || 0;
    tasbihSummaryLoader.style.display = 'none';
    tasbihSummaryContainer.innerHTML = `<p class="summary-text">آخری تسبیح: ${lastTasbih} (${lastCount}/${tasbihSelect.value})</p>`;
}

function showIslamicEventCountdown() {
    const ramadan2026 = new Date('2026-03-05T00:00:00Z'); // Example: Ramadan 1447 AH
    const now = new Date();
    const timeDiff = ramadan2026 - now;
    if (timeDiff > 0) {
        const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
        islamicEventLoader.style.display = 'none';
        islamicEventContainer.innerHTML = `<p class="event-countdown">اگلا ایونٹ: رمضان 1447 ہجری (${days} دن باقی)</p>`;
    } else {
        islamicEventLoader.textContent = "اگلا ایونٹ جلد اپ ڈیٹ کیا جائے گا۔";
    }
}

// --- Dua, Kalma, Hadith & 99 Names Data & Functionality ---
const namesData = [
    { name: "الرحمن", transliteration: "Ar-Rahman", ur_meaning: "بہت مہربان" },
    { name: "الرحيم", transliteration: "Ar-Rahim", ur_meaning: "نہایت رحم والا" },
    { name: "الملك", transliteration: "Al-Malik", ur_meaning: "بادشاہ" },
    { name: "القدوس", transliteration: "Al-Quddus", ur_meaning: "پاک ذات" },
    { name: "السلام", transliteration: "As-Salam", ur_meaning: "امن دینے والا" },
    { name: "المؤمن", transliteration: "Al-Mu’min", ur_meaning: "امن عطا کرنے والا" },
    { name: "المهيمن", transliteration: "Al-Muhaymin", ur_meaning: "نگہبان" },
    { name: "العزيز", transliteration: "Al-Azeez", ur_meaning: "غالب" },
    { name: "الجبار", transliteration: "Al-Jabbar", ur_meaning: "زبردست" },
    { name: "المتكبر", transliteration: "Al-Mutakabbir", ur_meaning: "بزرگی والا" },
    { name: "الخالق", transliteration: "Al-Khaliq", ur_meaning: "پیدا کرنے والا" },
    { name: "البارئ", transliteration: "Al-Bari", ur_meaning: "بنانے والا" },
    { name: "المصور", transliteration: "Al-Musawwir", ur_meaning: "صورت دینے والا" },
    { name: "الغفار", transliteration: "Al-Ghaffar", ur_meaning: "بخشنے والا" },
    { name: "القهار", transliteration: "Al-Qahhar", ur_meaning: "غلبہ والا" },
    { name: "الوهاب", transliteration: "Al-Wahhab", ur_meaning: "عطا کرنے والا" },
    { name: "الرزاق", transliteration: "Ar-Razzaq", ur_meaning: "رزق دینے والا" },
    { name: "الفتاح", transliteration: "Al-Fattah", ur_meaning: "فتح دینے والا" },
    { name: "العليم", transliteration: "Al-Aleem", ur_meaning: "سب کچھ جاننے والا" },
    { name: "القابض", transliteration: "Al-Qabid", ur_meaning: "تنگ کرنے والا" },
    { name: "الباسط", transliteration: "Al-Basit", ur_meaning: "کشادہ کرنے والا" },
    { name: "الخافض", transliteration: "Al-Khafid", ur_meaning: "نیچا کرنے والا" },
    { name: "الرافع", transliteration: "Ar-Rafi", ur_meaning: "بلند کرنے والا" },
    { name: "المعز", transliteration: "Al-Mu’izz", ur_meaning: "عزت دینے والا" },
    { name: "المذل", transliteration: "Al-Muzil", ur_meaning: "ذلت دینے والا" },
    { name: "السميع", transliteration: "As-Sami", ur_meaning: "سننے والا" },
    { name: "البصير", transliteration: "Al-Baseer", ur_meaning: "دیکھنے والا" },
    { name: "الحكم", transliteration: "Al-Hakam", ur_meaning: "فیصلہ کرنے والا" },
    { name: "العدل", transliteration: "Al-Adl", ur_meaning: "انصاف کرنے والا" },
    { name: "اللطيف", transliteration: "Al-Lateef", ur_meaning: "نرمی کرنے والا" },
    { name: "الخبير", transliteration: "Al-Khabeer", ur_meaning: "باخبر" },
    { name: "الحليم", transliteration: "Al-Haleem", ur_meaning: "بردبار" },
    { name: "العظيم", transliteration: "Al-Azeem", ur_meaning: "عظمت والا" },
    { name: "الغفور", transliteration: "Al-Ghafoor", ur_meaning: "معاف کرنے والا" },
    { name: "الشكور", transliteration: "Ash-Shakoor", ur_meaning: "قدر دان" },
    { name: "العلي", transliteration: "Al-Ali", ur_meaning: "بلند مرتبہ والا" },
    { name: "الكبير", transliteration: "Al-Kabeer", ur_meaning: "بڑا" },
    { name: "الحفيظ", transliteration: "Al-Hafeez", ur_meaning: "نگہبان" },
    { name: "المقيت", transliteration: "Al-Muqeet", ur_meaning: "رزق دینے والا" },
    { name: "الحسيب", transliteration: "Al-Haseeb", ur_meaning: "حساب لینے والا" },
    { name: "الجليل", transliteration: "Al-Jaleel", ur_meaning: "عظمت والا" },
    { name: "الكريم", transliteration: "Al-Kareem", ur_meaning: "کرم کرنے والا" },
    { name: "الرقيب", transliteration: "Ar-Raqeeb", ur_meaning: "نگہبان" },
    { name: "المجيب", transliteration: "Al-Mujib", ur_meaning: "دعا قبول کرنے والا" },
    { name: "الواسع", transliteration: "Al-Wasi", ur_meaning: "وسعت والا" },
    { name: "الحكيم", transliteration: "Al-Hakeem", ur_meaning: "حکمت والا" },
    { name: "الودود", transliteration: "Al-Wadood", ur_meaning: "محبت کرنے والا" },
    { name: "المجيد", transliteration: "Al-Majeed", ur_meaning: "عزت والا" },
    { name: "الباعث", transliteration: "Al-Ba’ith", ur_meaning: "دوبارہ اٹھانے والا" },
    { name: "الشهيد", transliteration: "Ash-Shaheed", ur_meaning: "گواہ" },
    { name: "الحق", transliteration: "Al-Haqq", ur_meaning: "حق" },
    { name: "الوكيل", transliteration: "Al-Wakeel", ur_meaning: "کارساز" },
    { name: "القوي", transliteration: "Al-Qawiyy", ur_meaning: "طاقتور" },
    { name: "المتين", transliteration: "Al-Mateen", ur_meaning: "مضبوط" },
    { name: "الولي", transliteration: "Al-Waliyy", ur_meaning: "مددگار" },
    { name: "الحميد", transliteration: "Al-Hameed", ur_meaning: "قابل تعریف" },
    { name: "المحصي", transliteration: "Al-Muhsi", ur_meaning: "شمار کرنے والا" },
    { name: "المبدئ", transliteration: "Al-Mubdi", ur_meaning: "شروع کرنے والا" },
    { name: "المعيد", transliteration: "Al-Mu’id", ur_meaning: "لوٹانے والا" },
    { name: "المحيي", transliteration: "Al-Muhyi", ur_meaning: "زندگی دینے والا" },
    { name: "المميت", transliteration: "Al-Mumeet", ur_meaning: "موت دینے والا" },
    { name: "الحي", transliteration: "Al-Hayy", ur_meaning: "ہمیشہ زندہ" },
    { name: "القيوم", transliteration: "Al-Qayyum", ur_meaning: "ہمیشہ قائم" },
    { name: "الواجد", transliteration: "Al-Wajid", ur_meaning: "پانے والا" },
    { name: "الماجد", transliteration: "Al-Majid", ur_meaning: "عظمت والا" },
    { name: "الواحد", transliteration: "Al-Wahid", ur_meaning: "ایک" },
    { name: "الاحد", transliteration: "Al-Ahad", ur_meaning: "واحد" },
    { name: "الصمد", transliteration: "As-Samad", ur_meaning: "بے نیاز" },
    { name: "القادر", transliteration: "Al-Qadir", ur_meaning: "قدرت والا" },
    { name: "المقتدر", transliteration: "Al-Muqtadir", ur_meaning: "زور آور" },
    { name: "المقدم", transliteration: "Al-Muqaddim", ur_meaning: "آگے کرنے والا" },
    { name: "المؤخر", transliteration: "Al-Mu’akhkhir", ur_meaning: "پیچھے کرنے والا" },
    { name: "الأول", transliteration: "Al-Awwal", ur_meaning: "پہلا" },
    { name: "الآخر", transliteration: "Al-Akhir", ur_meaning: "آخری" },
    { name: "الظاهر", transliteration: "Az-Zahir", ur_meaning: "ظاہر" },
    { name: "الباطن", transliteration: "Al-Batin", ur_meaning: "پوشیدہ" },
    { name: "الوالي", transliteration: "Al-Wali", ur_meaning: "حاکم" },
    { name: "المتعالي", transliteration: "Al-Muta’ali", ur_meaning: "سب سے بلند" },
    { name: "البر", transliteration: "Al-Barr", ur_meaning: "نیکی کرنے والا" },
    { name: "التواب", transliteration: "At-Tawwab", ur_meaning: "توبہ قبول کرنے والا" },
    { name: "المنتقم", transliteration: "Al-Muntaqim", ur_meaning: "بدلہ لینے والا" },
    { name: "العفو", transliteration: "Al-Afuww", ur_meaning: "معاف کرنے والا" },
    { name: "الرؤوف", transliteration: "Ar-Ra’uf", ur_meaning: "نہایت مہربان" },
    { name: "مالك الملك", transliteration: "Malik-ul-Mulk", ur_meaning: "بادشاہت کا مالک" },
    { name: "ذو الجلال والإكرام", transliteration: "Dhul-Jalal-wal-Ikram", ur_meaning: "جلال اور عزت والا" },
    { name: "المقسط", transliteration: "Al-Muqsit", ur_meaning: "انصاف کرنے والا" },
    { name: "الجامع", transliteration: "Al-Jami", ur_meaning: "جمع کرنے والا" },
    { name: "الغني", transliteration: "Al-Ghani", ur_meaning: "بے نیاز" },
    { name: "المغني", transliteration: "Al-Mughni", ur_meaning: "غنیمت دینے والا" },
    { name: "المانع", transliteration: "Al-Mani", ur_meaning: "روکنے والا" },
    { name: "الضار", transliteration: "Ad-Darr", ur_meaning: "نقصان پہنچانے والا" },
    { name: "النافع", transliteration: "An-Nafi", ur_meaning: "نفع دینے والا" },
    { name: "النور", transliteration: "An-Nur", ur_meaning: "نور" },
    { name: "الهادي", transliteration: "Al-Hadi", ur_meaning: "ہدایت دینے والا" },
    { name: "البديع", transliteration: "Al-Badi", ur_meaning: "عجائب پیدا کرنے والا" },
    { name: "الباقي", transliteration: "Al-Baqi", ur_meaning: "ہمیشہ رہنے والا" },
    { name: "الوارث", transliteration: "Al-Warith", ur_meaning: "وارث" },
    { name: "الرشيد", transliteration: "Ar-Rashid", ur_meaning: "ہدایت دینے والا" },
    { name: "الصبور", transliteration: "As-Sabur", ur_meaning: "صبر کرنے والا" },
];

const allContent = [
    // 6 کلمے
    { category: "6 کلمے", arabic: "لَا إِلَهَ إِلَّا اللَّهُ مُحَمَّدٌ رَسُولُ اللَّهِ", translation: "کوئی معبود نہیں سوائے اللہ کے، محمد صلی اللہ علیہ وسلم اللہ کے رسول ہیں۔", reference: "صحیح بخاری" },
    { category: "6 کلمے", arabic: "أَشْهَدُ أَنْ لَا إِلَهَ إِلَّا اللَّهُ وَأَشْهَدُ أَنَّ مُحَمَّدًا عَبْدُهُ وَرَسُولُهُ", translation: "میں گواہی دیتا ہوں کہ کوئی معبود نہیں سوائے اللہ کے، اور میں گواہی دیتا ہوں کہ محمد صلی اللہ علیہ وسلم اس کے بندے اور رسول ہیں۔", reference: "صحیح مسلم" },
    { category: "6 کلمے", arabic: "سُبْحَانَ اللَّهِ وَالْحَمْدُ لِلَّهِ وَلَا إِلَهَ إِلَّا اللَّهُ وَاللَّهُ أَكْبَرُ", translation: "اللہ پاک ہے، تمام تعریفیں اللہ کے لیے ہیں، کوئی معبود نہیں سوائے اللہ کے، اور اللہ سب سے بڑا ہے۔", reference: "صحیح بخاری" },
    { category: "6 کلمے", arabic: "لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ يُحْيِي وَيُمِيتُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ", translation: "کوئی معبود نہیں سوائے اللہ کے، وہ اکیلا ہے، اس کا کوئی شریک نہیں، اسی کے لیے بادشاہی ہے اور اسی کے لیے حمد ہے، وہ زندہ کرتا ہے اور مارتا ہے، اور وہ ہر چیز پر قادر ہے۔", reference: "صحیح مسلم" },
    { category: "6 کلمے", arabic: "أَسْتَغْفِرُ اللَّهَ رَبِّي مِنْ كُلِّ ذَنْبٍ وَأَتُوبُ إِلَيْهِ", translation: "میں اپنے رب اللہ سے ہر گناہ کی مغفرت مانگتا ہوں اور اس کی طرف توبہ کرتا ہوں۔", reference: "صحیح بخاری" },
    { category: "6 کلمے", arabic: "اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنْ أَنْ أُشْرِكَ بِكَ شَيْئًا وَأَنَا أَعْلَمُ، وَأَسْتَغْفِرُكَ لِمَا لَا أَعْلَمُ", translation: "اے اللہ! میں تیری پناہ مانگتا ہوں اس سے کہ میں جانتے ہوئے تیرے ساتھ کسی کو شریک کروں، اور اس کے لیے مغفرت مانگتا ہوں جو میں نہیں جانتا۔", reference: "ابو داؤد" },
    // 50 دعائیں
    { category: "50 دعائیں", arabic: "اَللّٰھُمَّ اِنِّیْ اَسْئَلُکَ الْعَفْوَ وَالْعَافِیَةَ فِی الدُّنْیَا وَالْآخِرَةِ", translation: "اے اللہ! میں تجھ سے دنیا اور آخرت میں معافی اور عافیت مانگتا ہوں۔", reference: "ابن ماجہ" },
    { category: "50 دعائیں", arabic: "رَبَّنَا آتِنَا فِی الدُّنْیَا حَسَنَةً وَّفِی الْآخِرَةِ حَسَنَةً وَّقِنَا عَذَابَ النَّارِ", translation: "اے ہمارے رب! ہمیں دنیا میں بھلائی عطا فرما اور آخرت میں بھلائی عطا فرما اور ہمیں آگ کے عذاب سے بچا۔", reference: "البقرہ: 201" },
    { category: "50 دعائیں", arabic: "أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ", translation: "میں اللہ کے کامل کلمات کے ساتھ اس شر سے پناہ مانگتا ہوں جو اس نے پیدا کیا۔", reference: "صحیح مسلم" },
    { category: "50 دعائیں", arabic: "اللَّهُمَّ اغْفِرْ لِي ذَنْبِي كُلَّهُ دِقَّهُ وَجِلَّهُ وَأَوَّلَهُ وَآخِرَهُ وَعَلَانِيَتَهُ وَسِرَّهُ", translation: "اے اللہ! میرے تمام گناہ معاف فرما، چھوٹے اور بڑے، پہلے اور آخری، ظاہری اور پوشیدہ۔", reference: "صحیح مسلم" },
    { category: "50 دعائیں", arabic: "اللَّهُمَّ إِنِّي أَسْأَلُكَ الْجَنَّةَ وَأَعُوذُ بِكَ مِنَ النَّارِ", translation: "اے اللہ! میں تجھ سے جنت مانگتا ہوں اور جہنم سے تیری پناہ مانگتا ہوں۔", reference: "ابو داؤد" }
];

function loadDuaContent() {
    const categories = [...new Set(allContent.map(item => item.category))];
    duaCategoriesContainer.innerHTML = '';
    categories.forEach(category => {
        const button = document.createElement('button');
        button.className = 'category-button';
        button.textContent = category;
        button.addEventListener('click', () => {
            document.querySelectorAll('.category-button').forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            displayContent(category);
        });
        duaCategoriesContainer.appendChild(button);
    });
    if (categories.length > 0) {
        duaCategoriesContainer.querySelector('.category-button').classList.add('active');
        displayContent(categories[0]);
    }
}

function displayContent(category) {
    duaListContainer.innerHTML = '';
    const items = allContent.filter(item => item.category === category);
    items.forEach(item => {
        const card = document.createElement('div');
        card.className = 'dua-card';
        card.innerHTML = `
            <p class="dua-arabic">${item.arabic}</p>
            <p class="dua-translation">${item.translation}${item.reference ? ` (${item.reference})` : ''}</p>
        `;
        duaListContainer.appendChild(card);
    });
}

function displayNames() {
    namesContainer.innerHTML = '';
    namesData.forEach(name => {
        const card = document.createElement('div');
        card.className = 'name-card';
        card.innerHTML = `
            <p class="name-arabic">${name.name}</p>
            <p class="name-translation">${name.ur_meaning} (${name.transliteration})</p>
        `;
        namesContainer.appendChild(card);
    });
}

showNamesBtn.addEventListener('click', () => {
    openModal('names-modal');
    displayNames();
});

function openModal(modalId) {
    document.getElementById(modalId).style.display = 'flex';
}

function closeAllModals() {
    document.querySelectorAll('.modal').forEach(modal => {
        modal.style.display = 'none';
    });
}

// --- Rate & Share Functionality ---
rateAppLink.addEventListener('click', (e) => {
    e.preventDefault();
    duaListContainer.innerHTML = '<div class="coming-soon-container"><span class="material-symbols-outlined">construction</span><p>یہ فیچر جلد آ رہا ہے!</p></div>';
});

shareAppLink.addEventListener('click', async (e) => {
    e.preventDefault();
    try {
        await navigator.share({
            title: 'القرآن الكريم - Faraz AI',
            text: 'اس شاندار ایپ سے قرآن پڑھیں، دعائیں سیکھیں، اور فراز AI سے اسلامی سوالات کے جوابات حاصل کریں!',
            url: window.location.href
        });
    } catch (error) {
        duaListContainer.innerHTML = '<div class="coming-soon-container"><span class="material-symbols-outlined">share</span><p>شیئر کرنے میں ناکامی، براہ کرم دوبارہ کوشش کریں۔</p></div>';
    }
});

// --- Initialize App ---
document.addEventListener('DOMContentLoaded', () => {
    showPage('homeCustomPage');
    fetchSurahList();
    updateTarget();
    loadDuaContent();
    showRandomAyah();
    showDuaOfTheDay();
    showTasbihSummary();
    showIslamicEventCountdown();
    setInterval(showRandomAyah, 600000); // Refresh ayah every 10 minutes
    setInterval(showDuaOfTheDay, 600000); // Refresh dua every 10 minutes

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(position => {
            const { latitude, longitude } = position.coords;
            getPrayerTimes(latitude, longitude);
            getQiblaDirection(latitude, longitude);
            getIslamicDate(latitude, longitude);
        }, () => {
            prayerTimeLoader.textContent = "لوکیشن کی اجازت درکار ہے۔";
            qiblaLoader.textContent = "لوکیشن کی اجازت درکار ہے۔";
            islamicDateLoader.textContent = "لوکیشن کی اجازت درکار ہے۔";
        });
    } else {
        prayerTimeLoader.textContent = "آپ کا براؤزر لوکیشن کو سپورٹ نہیں کرتا۔";
        qiblaLoader.textContent = "آپ کا براؤزر لوکیشن کو سپورٹ نہیں کرتا۔";
        islamicDateLoader.textContent = "آپ کا براؤزر لوکیشن کو سپورٹ نہیں کرتا۔";
    }
});

// --- Service Worker Registration ---
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').then(registration => {
            console.log('Service Worker registered with scope:', registration.scope);
        }).catch(error => {
            console.log('Service Worker registration failed:', error);
        });
    });
}
