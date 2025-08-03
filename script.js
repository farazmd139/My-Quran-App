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

// --- Dua, Kalma, Hadith & 99 Names Data & Functionality ---
// This is the largest part of the code, containing all your data.
let allContent = [];
const namesData = [
    {"name": "الرحمن", "transliteration": "Ar-Rahman", "ur_meaning": "بہت مہربان"},
    {"name": "الرحيم", "transliteration": "Ar-Rahim", "ur_meaning": "نہایت رحم والا"},
    {"name": "الملك", "transliteration": "Al-Malik", "ur_meaning": "بادشاہ"},
    {"name": "القدوس", "transliteration": "Al-Quddus", "ur_meaning": "پاک"},
    {"name": "السلام", "transliteration": "As-Salam", "ur_meaning": "سلامتی والا"},
    {"name": "المؤمن", "transliteration": "Al-Mu'min", "ur_meaning": "امن دینے والا"},
    {"name": "المهيمن", "transliteration": "Al-Muhaymin", "ur_meaning": "نگہبان"},
    {"name": "العزيز", "transliteration": "Al-Aziz", "ur_meaning": "غالب"},
    {"name": "الجبار", "transliteration": "Al-Jabbar", "ur_meaning": "زبردست"},
    {"name": "المتكبر", "transliteration": "Al-Mutakabbir", "ur_meaning": "بڑائی والا"},
    {"name": "الخالق", "transliteration": "Al-Khaliq", "ur_meaning": "پیدا کرنے والا"},
    {"name": "البارئ", "transliteration": "Al-Bari'", "ur_meaning": "بنانے والا"},
    {"name": "المصور", "transliteration": "Al-Musawwir", "ur_meaning": "صورت دینے والا"},
    {"name": "الغفار", "transliteration": "Al-Ghaffar", "ur_meaning": "بخشنے والا"},
    {"name": "القهار", "transliteration": "Al-Qahhar", "ur_meaning": "قہر نازل کرنے والا"},
    {"name": "الوهاب", "transliteration": "Al-Wahhab", "ur_meaning": "عطا کرنے والا"},
    {"name": "الرزاق", "transliteration": "Ar-Razzaq", "ur_meaning": "رزق دینے والا"},
    {"name": "الفتاح", "transliteration": "Al-Fattah", "ur_meaning": "کھولنے والا"},
    {"name": "العليم", "transliteration": "Al-'Alim", "ur_meaning": "جاننے والا"},
    {"name": "القابض", "transliteration": "Al-Qabid", "ur_meaning": "تنگ کرنے والا"},
    {"name": "الباسط", "transliteration": "Al-Basit", "ur_meaning": "فراخ کرنے والا"},
    {"name": "الخافض", "transliteration": "Al-Khafid", "ur_meaning": "پست کرنے والا"},
    {"name": "الرافع", "transliteration": "Ar-Rafi'", "ur_meaning": "بلند کرنے والا"},
    {"name": "المعز", "transliteration": "Al-Mu'izz", "ur_meaning": "عزت دینے والا"},
    {"name": "المذل", "transliteration": "Al-Mudhill", "ur_meaning": "ذلت دینے والا"},
    {"name": "السميع", "transliteration": "As-Sami'", "ur_meaning": "سننے والا"},
    {"name": "البصير", "transliteration": "Al-Basir", "ur_meaning": "دیکھنے والا"},
    {"name": "الحكم", "transliteration": "Al-Hakam", "ur_meaning": "فیصلہ کرنے والا"},
    {"name": "العدل", "transliteration": "Al-'Adl", "ur_meaning": "انصاف کرنے والا"},
    {"name": "اللطيف", "transliteration": "Al-Latif", "ur_meaning": "مہربان"},
    {"name": "الخبير", "transliteration": "Al-Khabir", "ur_meaning": "خبردار"},
    {"name": "الحليم", "transliteration": "Al-Halim", "ur_meaning": "بردبار"},
    {"name": "العظيم", "transliteration": "Al-'Azim", "ur_meaning": "عظمت والا"},
    {"name": "الغفور", "transliteration": "Al-Ghafur", "ur_meaning": "بخشنے والا"},
    {"name": "الشكور", "transliteration": "Ash-Shakur", "ur_meaning": "قدردان"},
    {"name": "العلي", "transliteration": "Al-'Ali", "ur_meaning": "بلند"},
    {"name": "الكبير", "transliteration": "Al-Kabir", "ur_meaning": "بڑا"},
    {"name": "الحفيظ", "transliteration": "Al-Hafiz", "ur_meaning": "حفاظت کرنے والا"},
    {"name": "المقيت", "transliteration": "Al-Muqit", "ur_meaning": "روزی دینے والا"},
    {"name": "الحسيب", "transliteration": "Al-Hasib", "ur_meaning": "حساب لینے والا"},
    {"name": "الجليل", "transliteration": "Al-Jalil", "ur_meaning": "بزرگی والا"},
    {"name": "الكريم", "transliteration": "Al-Karim", "ur_meaning": "کرم کرنے والا"},
    {"name": "الرقيب", "transliteration": "Ar-Raqib", "ur_meaning": "نگران"},
    {"name": "المجيب", "transliteration": "Al-Mujib", "ur_meaning": "قبول کرنے والا"},
    {"name": "الواسع", "transliteration": "Al-Wasi'", "ur_meaning": "وسعت والا"},
    {"name": "الحكيم", "transliteration": "Al-Hakim", "ur_meaning": "حکمت والا"},
    {"name": "الودود", "transliteration": "Al-Wadud", "ur_meaning": "محبت کرنے والا"},
    {"name": "المجيد", "transliteration": "Al-Majid", "ur_meaning": "بزرگی والا"},
    {"name": "الباعث", "transliteration": "Al-Ba'ith", "ur_meaning": "اٹھانے والا"},
    {"name": "الشهيد", "transliteration": "Ash-Shahid", "ur_meaning": "گواہ"},
    {"name": "الحق", "transliteration": "Al-Haqq", "ur_meaning": "حق"},
    {"name": "الوكيل", "transliteration": "Al-Wakil", "ur_meaning": "کارساز"},
    {"name": "القوي", "transliteration": "Al-Qawiyy", "ur_meaning": "طاقتور"},
    {"name": "المتين", "transliteration": "Al-Matin", "ur_meaning": "مضبوط"},
    {"name": "الولي", "transliteration": "Al-Waliyy", "ur_meaning": "دوست"},
    {"name": "الحميد", "transliteration": "Al-Hamid", "ur_meaning": "تعریف کے لائق"},
    {"name": "المحصي", "transliteration": "Al-Muhsi", "ur_meaning": "شمار کرنے والا"},
    {"name": "المبدئ", "transliteration": "Al-Mubdi'", "ur_meaning": "شروع کرنے والا"},
    {"name": "المعيد", "transliteration": "Al-Mu'id", "ur_meaning": "لوٹانے والا"},
    {"name": "المحيي", "transliteration": "Al-Muhyi", "ur_meaning": "زندہ کرنے والا"},
    {"name": "المميت", "transliteration": "Al-Mumit", "ur_meaning": "موت دینے والا"},
    {"name": "الحي", "transliteration": "Al-Hayy", "ur_meaning": "زندہ"},
    {"name": "القيوم", "transliteration": "Al-Qayyum", "ur_meaning": "قائم رکھنے والا"},
    {"name": "الواجد", "transliteration": "Al-Wajid", "ur_meaning": "پانے والا"},
    {"name": "الماجد", "transliteration": "Al-Majid", "ur_meaning": "بزرگی والا"},
    {"name": "الواحد", "transliteration": "Al-Wahid", "ur_meaning": "ایک"},
    {"name": "الأحد", "transliteration": "Al-Ahad", "ur_meaning": "یکتا"},
    {"name": "الصمد", "transliteration": "As-Samad", "ur_meaning": "بے نیاز"},
    {"name": "القادر", "transliteration": "Al-Qadir", "ur_meaning": "قدرت والا"},
    {"name": "المقتدر", "transliteration": "Al-Muqtadir", "ur_meaning": "اقتدار والا"},
    {"name": "المقدم", "transliteration": "Al-Muqaddim", "ur_meaning": "آگے کرنے والا"},
    {"name": "المؤخر", "transliteration": "Al-Mu'akhkhir", "ur_meaning": "پیچھے کرنے والا"},
    {"name": "الأول", "transliteration": "Al-Awwal", "ur_meaning": "پہلا"},
    {"name": "الآخر", "transliteration": "Al-Akhir", "ur_meaning": "آخری"},
    {"name": "الظاهر", "transliteration": "Az-Zahir", "ur_meaning": "ظاہر"},
    {"name": "الباطن", "transliteration": "Al-Batin", "ur_meaning": "پوشیدہ"},
    {"name": "الوالي", "transliteration": "Al-Wali", "ur_meaning": "حاکم"},
    {"name": "المتعالي", "transliteration": "Al-Muta'ali", "ur_meaning": "بلند"},
    {"name": "البر", "transliteration": "Al-Barr", "ur_meaning": "نیکی کرنے والا"},
    {"name": "التواب", "transliteration": "At-Tawwab", "ur_meaning": "توبہ قبول کرنے والا"},
    {"name": "المنتقم", "transliteration": "Al-Muntaqim", "ur_meaning": "انتقام لینے والا"},
    {"name": "العفو", "transliteration": "Al-'Afuww", "ur_meaning": "معاف کرنے والا"},
    {"name": "الرءوف", "transliteration": "Ar-Ra'uf", "ur_meaning": "شفقت کرنے والا"},
    {"name": "مالك الملك", "transliteration": "Malik-ul-Mulk", "ur_meaning": "بادشاہی کا مالک"},
    {"name": "ذو الجلال والإكرام", "transliteration": "Dhul-Jalal wal-Ikram", "ur_meaning": "جلال اور اکرام والا"},
    {"name": "المقسط", "transliteration": "Al-Muqsit", "ur_meaning": "انصاف کرنے والا"},
    {"name": "الجامع", "transliteration": "Al-Jami'", "ur_meaning": "جمع کرنے والا"},
    {"name": "الغني", "transliteration": "Al-Ghani", "ur_meaning": "بے نیاز"},
    {"name": "المغني", "transliteration": "Al-Mughni", "ur_meaning": "بے نیاز کرنے والا"},
    {"name": "المانع", "transliteration": "Al-Mani'", "ur_meaning": "روکنے والا"},
    {"name": "الضار", "transliteration": "Ad-Darr", "ur_meaning": "نقصان پہنچانے والا"},
    {"name": "النافع", "transliteration": "An-Nafi'", "ur_meaning": "نفع پہنچانے والا"},
    {"name": "النور", "transliteration": "An-Nur", "ur_meaning": "نور"},
    {"name": "الهادي", "transliteration": "Al-Hadi", "ur_meaning": "ہدایت دینے والا"},
    {"name": "البديع", "transliteration": "Al-Badi'", "ur_meaning": "انوکھا"},
    {"name": "الباقي", "transliteration": "Al-Baqi", "ur_meaning": "باقی رہنے والا"},
    {"name": "الوارث", "transliteration": "Al-Warith", "ur_meaning": "وارث"},
    {"name": "الرشيد", "transliteration": "Ar-Rashid", "ur_meaning": "ہدایت دینے والا"},
    {"name": "الصبور", "transliteration": "As-Sabur", "ur_meaning": "صبر کرنے والا"}
];

function loadContentData() {
    allContent = [
        // 6 Kalmas
        { category: "کلمے", arabic: "لَا إِلَهَ إِلَّا اللَّهُ مُحَمَّدٌ رَسُولُ اللَّهِ", translation: "کوئی معبود نہیں سوائے اللہ کے، محمد صلی اللہ علیہ وسلم اللہ کے رسول ہیں۔" },
        { category: "کلمے", arabic: "أَشْهَدُ أَنْ لَا إِلَهَ إِلَّا اللَّهُ وَأَشْهَدُ أَنَّ مُحَمَّدًا عَبْدُهُ وَرَسُولُهُ", translation: "میں گواہی دیتا ہوں کہ کوئی معبود نہیں سوائے اللہ کے، اور میں گواہی دیتا ہوں کہ محمد صلی اللہ علیہ وسلم اس کے بندے اور رسول ہیں۔" },
        { category: "کلمے", arabic: "سُبْحَانَ اللَّهِ وَالْحَمْدُ لِلَّهِ وَلَا إِلَهَ إِلَّا اللَّهُ وَاللَّهُ أَكْبَرُ", translation: "اللہ پاک ہے، تمام تعریفیں اللہ کے لیے ہیں، کوئی معبود نہیں سوائے اللہ کے، اور اللہ سب سے بڑا ہے۔" },
        { category: "کلمے", arabic: "لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ يُحْيِي وَيُمِيتُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ", translation: "کوئی معبود نہیں سوائے اللہ کے، وہ اکیلا ہے، اس کا کوئی شریک نہیں، اسی کے لیے بادشاہی ہے اور اسی کے لیے حمد ہے، وہ زندہ کرتا ہے اور مارتا ہے، اور وہ ہر چیز پر قادر ہے۔" },
        { category: "کلمے", arabic: "أَسْتَغْفِرُ اللَّهَ رَبِّي مِنْ كُلِّ ذَنْبٍ وَأَتُوبُ إِلَيْهِ", translation: "میں اپنے رب اللہ سے ہر گناہ کی مغفرت مانگتا ہوں اور اس کی طرف توبہ کرتا ہوں۔" },
        { category: "کلمے", arabic: "اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنْ أَنْ أُشْرِكَ بِكَ شَيْئًا وَأَنَا أَعْلَمُ، وَأَسْتَغْفِرُكَ لِمَا لَا أَعْلَمُ", translation: "اے اللہ! میں تیری پناہ مانگتا ہوں اس سے کہ میں جانتے ہوئے تیرے ساتھ کسی کو شریک کروں، اور اس کے لیے مغفرت مانگتا ہوں جو میں نہیں جانتا۔" },
        
        // 50 Duas
        { category: "دعائیں", arabic: "اَللّٰھُمَّ اِنِّیْ اَسْئَلُکَ الْعَفْوَ وَالْعَافِیَةَ فِی الدُّنْیَا وَالْآخِرَةِ", translation: "اے اللہ! میں تجھ سے دنیا اور آخرت میں معافی اور عافیت مانگتا ہوں۔" },
        { category: "دعائیں", arabic: "رَبَّنَا آتِنَا فِی الدُّنْیَا حَسَنَةً وَّفِی الْآخِرَةِ حَسَنَةً وَّقِنَا عَذَابَ النَّارِ", translation: "اے ہمارے رب! ہمیں دنیا میں بھلائی عطا فرما اور آخرت میں بھلائی عطا فرما اور ہمیں آگ کے عذاب سے بچا۔" },
        { category: "دعائیں", arabic: "اَللّٰھُمَّ اجْعَلْنِیْ شَکُوْرًا وَّاجْعَلْنِیْ صَبُوْرًا", translation: "اے اللہ! مجھے شکر کرنے والا اور صبر کرنے والا بنا۔" },
        { category: "دعائیں", arabic: "اَللّٰھُمَّ اغْفِرْ لِیْ وَلِوَالِدَیَّ وَلِلْمُؤْمِنِیْنَ", translation: "اے اللہ! میری، میرے والدین کی اور تمام مومنوں کی مغفرت فرما۔" },
        { category: "دعائیں", arabic: "رَبِّ اغْفِرْ وَارْحَمْ وَاَنْتَ خَیْرُ الرَّاحِمِیْنَ", translation: "اے رب! معاف کر اور رحم فرما، تو سب سے بہتر رحم کرنے والا ہے۔" },
        { category: "دعائیں", arabic: "اَللّٰھُمَّ اِنِّیْ اَعُوْذُ بِکَ مِنَ الْعَجْزِ وَالْکَسَلِ", translation: "اے اللہ! میں تیری پناہ مانگتا ہوں عاجزی اور سستی سے۔" },
        { category: "دعائیں", arabic: "اَللّٰھُمَّ اِنِّیْ اَسْئَلُکَ الْہُدٰی وَالتُّقٰی وَالْعَفَافَ وَالْغِنٰی", translation: "اے اللہ! میں تجھ سے ہدایت، تقویٰ، پاکدامنی اور بے نیازی مانگتا ہوں۔" },
        { category: "دعائیں", arabic: "رَبِّ زِدْنِیْ عِلْمًا", translation: "اے رب! مجھے علم میں اضافہ فرما۔" },
        { category: "دعائیں", arabic: "اَللّٰھُمَّ اہْدِنِیْ وَسَدِّدْنِیْ", translation: "اے اللہ! مجھے ہدایت دے اور میری راہ درست کر۔" },
        { category: "دعائیں", arabic: "اَللّٰھُمَّ لَا سَھْلَ اِلَّا مَا جَعَلْتَہُ سَھْلًا", translation: "اے اللہ! کوئی چیز آسان نہیں سوائے اس کے جو تو آسان کر دے۔" },
        { category: "دعائیں", arabic: "اَللّٰھُمَّ اِنِّیْ اَعُوْذُ بِکَ مِنْ شَرِّ مَا عَمِلْتُ وَمَا لَمْ اَعْمَلْ", translation: "اے اللہ! میں تیری پناہ مانگتا ہوں اس شر سے جو میں نے کیا اور جو نہیں کیا۔" },
        { category: "دعائیں", arabic: "رَبِّ اِنِّیْ ظَلَمْتُ نَفْسِیْ فَاغْفِرْ لِیْ", translation: "اے رب! میں نے اپنی جان پر ظلم کیا، سو مجھے معاف فرما۔" },
        { category: "دعائیں", arabic: "اَللّٰھُمَّ اِنِّیْ اَسْئَلُکَ الْجَنَّةَ وَاَعُوْذُ بِکَ مِنَ النَّارِ", translation: "اے اللہ! میں تجھ سے جنت مانگتا ہوں اور دوزخ سے پناہ مانگتا ہوں۔" },
        { category: "دعائیں", arabic: "اَللّٰھُمَّ ارْزُقْنِیْ حُبَّکَ وَحُبَّ مَنْ یُحِبُّکَ", translation: "اے اللہ! مجھے تیری محبت اور اس کی محبت عطا فرما جو تجھ سے محبت کرتا ہو۔" },
        { category: "دعائیں", arabic: "رَبِّ ھَبْ لِیْ حُکْمًا وَّاَلْحِقْنِیْ بِالصَّالِحِیْنَ", translation: "اے رب! مجھے حکمت عطا فرما اور مجھے صالحین کے ساتھ ملا۔" },
        { category: "دعائیں", arabic: "اَللّٰھُمَّ اِنِّیْ اَسْئَلُکَ رِضَاکَ وَالْجَنَّةَ", translation: "اے اللہ! میں تجھ سے تیری رضا اور جنت مانگتا ہوں۔" },
        { category: "دعائیں", arabic: "اَللّٰھُمَّ اجْعَلْ خَیْرَ عُمْرِیْ آخِرَہُ", translation: "اے اللہ! میری عمر کا بہترین حصہ اس کا آخر بنا۔" },
        { category: "دعائیں", arabic: "اَللّٰھُمَّ اِنِّیْ اَعُوْذُ بِکَ مِنْ زَوَالِ نِعْمَتِکَ", translation: "اے اللہ! میں تیری پناہ مانگتا ہوں تیری نعمت کے زوال سے۔" },
        { category: "دعائیں", arabic: "رَبِّ اشْرَحْ لِیْ صَدْرِیْ وَیَسِّرْ لِیْ اَمْرِیْ", translation: "اے رب! میرا سینہ کھول دے اور میرا کام آسان کر دے۔" },
        { category: "دعائیں", arabic: "اَللّٰھُمَّ سَتِّرْ عَوْرَاتِیْ وَآمِنْ رَوْعَاتِیْ", translation: "اے اللہ! میری عیبوں کو چھپا اور میری پریشانیوں کو امن عطا فرما۔" },
        { category: "دعائیں", arabic: "اَللّٰھُمَّ اِنِّیْ اَعُوْذُ بِکَ مِنَ الْفِتْنَةِ فِی الدُّنْیَا وَالْآخِرَةِ", translation: "اے اللہ! میں تیری پناہ مانگتا ہوں دنیا اور آخرت کے فتنوں سے۔" },
        { category: "دعائیں", arabic: "اَللّٰھُمَّ اغْفِرْ لِیْ ذَنْبِیْ وَوَسِّعْ لِیْ فِیْ دَارِیْ", translation: "اے اللہ! میرا گناہ معاف کر اور میرے گھر میں وسعت عطا فرما۔" },
        { category: "دعائیں", arabic: "رَبِّ اَنْزِلْنِیْ مُنْزَلًا مُّبَارَکًا", translation: "اے رب! مجھے بابرکت جگہ اتار۔" },
        { category: "دعائیں", arabic: "اَللّٰھُمَّ اِنِّیْ اَسْئَلُکَ الْعَفْوَ وَالْمَغْفِرَةَ", translation: "اے اللہ! میں تجھ سے معافی اور مغفرت مانگتا ہوں۔" },
        { category: "دعائیں", arabic: "اَللّٰھُمَّ بَارِکْ لِیْ فِیْ رِزْقِیْ", translation: "اے اللہ! میرے رزق میں برکت عطا فرما۔" },
        { category: "دعائیں", arabic: "اَللّٰھُمَّ اِنِّیْ اَعُوْذُ بِکَ مِنْ جَھْدِ الْبَلَاءِ", translation: "اے اللہ! میں تیری پناہ مانگتا ہوں شدید مصیبت سے۔" },
        { category: "دعائیں", arabic: "رَبِّ اجْعَلْنِیْ مُقِیْمَ الصَّلٰوةِ وَمِنْ ذُرِّیَّتِیْ", translation: "اے رب! مجھے اور میری اولاد کو نماز قائم کرنے والا بنا۔" },
        { category: "دعائیں", arabic: "اَللّٰھُمَّ اِنِّیْ اَسْئَلُکَ نَفْسًا مُّطْمَئِنَّةً", translation: "اے اللہ! میں تجھ سے اطمینان قلب مانگتا ہوں۔" },
        { category: "دعائیں", arabic: "اَللّٰھُمَّ حَاسِبْنِیْ حِسَابًا یَسِیْرًا", translation: "اے اللہ! میرا حساب آسان کر۔" },
        { category: "دعائیں", arabic: "رَبِّ تَقَبَّلْ تَوْبَتِیْ وَاغْسِلْ حَوْبَتِیْ", translation: "اے رب! میری توبہ قبول فرما اور میری خطائیں دھو دے۔" },
        { category: "دعائیں", arabic: "اَللّٰھُمَّ ارْزُقْنِیْ تَوْفِیْقَ طَاعَتِکَ", translation: "اے اللہ! مجھے تیری اطاعت کی توفیق عطا فرما۔" },
        { category: "دعائیں", arabic: "اَللّٰھُمَّ اِنِّیْ اَعُوْذُ بِکَ مِنْ ضِیْقِ الدُّنْیَا", translation: "اے اللہ! میں تیری پناہ مانگتا ہوں دنیا کی تنگی سے۔" },
        { category: "دعائیں", arabic: "رَبِّ اَدْخِلْنِیْ مُدْخَلَ صِدْقٍ وَّاَخْرِجْنِیْ مُخْرَجَ صِدْقٍ", translation: "اے رب! مجھے سچائی کے ساتھ داخل کر اور سچائی کے ساتھ نکال۔" },
        { category: "دعائیں", arabic: "اَللّٰھُمَّ اِنِّیْ اَسْئَلُکَ خَیْرَ الْمَسْئَلَةِ", translation: "اے اللہ! میں تجھ سے بہترین دعا مانگتا ہوں۔" },
        { category: "دعائیں", arabic: "اَللّٰھُمَّ اجْعَلْنِیْ مِنَ التَّوَّابِیْنَ", translation: "اے اللہ! مجھے توبہ کرنے والوں میں سے کر۔" },
        { category: "دعائیں", arabic: "اَللّٰھُمَّ اِنِّیْ اَعُوْذُ بِکَ مِنْ عَذَابِ الْقَبْرِ", translation: "اے اللہ! میں تیری پناہ مانگتا ہوں قبر کے عذاب سے۔" },
        { category: "دعائیں", arabic: "رَبِّ لَا تَذَرْنِیْ فَرْدًا وَّاَنْتَ خَیْرُ الْوَارِثِیْنَ", translation: "اے رب! مجھے اکیلا نہ چھوڑ اور تو سب سے بہتر وارث ہے۔" },
        { category: "دعائیں", arabic: "اَللّٰھُمَّ اِنِّیْ اَسْئَلُکَ الْفَوْزَ فِی الْآخِرَةِ", translation: "اے اللہ! میں تجھ سے آخرت میں کامیابی مانگتا ہوں۔" },
        { category: "دعائیں", arabic: "اَللّٰھُمَّ اَصْلِحْ لِیْ دِیْنِیْ وَدُنْیَایَ", translation: "اے اللہ! میرے دین اور دنیا کو درست فرما۔" },
        { category: "دعائیں", arabic: "اَللّٰھُمَّ اِنِّیْ اَعُوْذُ بِکَ مِنَ الْہَمِّ وَالْحَزَنِ", translation: "اے اللہ! میں تیری پناہ مانگتا ہوں غم اور رنج سے۔" },
        { category: "دعائیں", arabic: "رَبِّ هَبْ لِیْ مِنْ لَدُنْکَ ذُرِّیَّةً طَیِّبَةً", translation: "اے رب! مجھے اپنے پاس سے پاکیزہ اولاد عطا فرما۔" },
        { category: "دعائیں", arabic: "اَللّٰھُمَّ اِنِّیْ اَسْئَلُکَ الْعِزَّةَ وَالنَّصْرَ", translation: "اے اللہ! میں تجھ سے عزت اور نصرت مانگتا ہوں۔" },
        { category: "دعائیں", arabic: "اَللّٰھُمَّ اجْعَلْ لِیْ نُوْرًا فِیْ قَلْبِیْ", translation: "اے اللہ! میرے دل میں نور عطا فرما۔" },
        { category: "دعائیں", arabic: "اَللّٰھُمَّ اِنِّیْ اَعُوْذُ بِکَ مِنْ شَرِّ النَّفْسِ", translation: "اے اللہ! میں تیری پناہ مانگتا ہوں نفس کے شر سے۔" },
        { category: "دعائیں", arabic: "رَبِّ قِنِیْ عَذَابَکَ یَوْمَ تَبْعَثُ عِبَادَکَ", translation: "اے رب! مجھے اس دن اپنے عذاب سے بچا جب تو اپنے بندوں کو اٹھائے گا۔" },
        { category: "دعائیں", arabic: "اَللّٰھُمَّ ارْزُقْنِیْ الصِّحَّةَ وَالسَّعَادَةَ", translation: "اے اللہ! مجھے صحت اور خوشی عطا فرما۔" },
        { category: "دعائیں", arabic: "اَللّٰھُمَّ اِنِّیْ اَسْئَلُکَ الْیُسْرَ بَعْدَ الْعُسْرِ", translation: "اے اللہ! میں تجھ سے دشواری کے بعد آسانی مانگتا ہوں۔" },
        { category: "دعائیں", arabic: "اَللّٰھُمَّ اجْعَلْنِیْ مِنَ الْمُتَّقِیْنَ", translation: "اے اللہ! مجھے متقیوں میں سے کر۔" },
        { category: "دعائیں", arabic: "اَللّٰھُمَّ اِنِّیْ اَعُوْذُ بِکَ مِنْ شَرِّ الْفِتَنِ", translation: "اے اللہ! میں تیری پناہ مانگتا ہوں فتنوں کے شر سے۔" },
        { category: "دعائیں", arabic: "اَللّٰھُمَّ تَقَبَّلْ مِنِّیْ صَلَاتِیْ وَدُعَائِیْ", translation: "اے اللہ! میری نماز اور دعا قبول فرما۔" },

        // 40 Hadiths
        { category: "احادیث", arabic: "إِنَّمَا الأَعْمَالُ بِالنِّيَّاتِ", translation: "اعمال کا دارومدار نیتوں پر ہے۔ (صحیح بخاری: 1)" },
        { category: "احادیث", arabic: "مَنْ صَامَ رَمَضَانَ إِيمَانًا وَاحْتِسَابًا غُفِرَ لَهُ مَا تَقَدَّمَ مِنْ ذَنْبِهِ", translation: "جو شخص ایمان اور احتساب کے ساتھ رمضان کے روزے رکھے، اس کے پچھلے گناہ معاف کر دیے جاتے ہیں۔ (صحیح بخاری: 2014)" },
        { category: "احادیث", arabic: "مَنْ قَامَ لَيْلَةَ الْقَدْرِ إِيمَانًا وَاحْتِسَابًا غُفِرَ لَهُ مَا تَقَدَّمَ مِنْ ذَنْبِهِ", translation: "جو شخص لیلۃ القدر میں ایمان اور احتساب کے ساتھ عبادت کرے، اس کے پچھلے گناہ معاف کر دیے جاتے ہیں۔ (صحیح بخاری: 2017)" },
        { category: "احادیث", arabic: "الدِّينُ النَّصِيحَةُ", translation: "دین خیرخواہی ہے۔ (صحیح مسلم: 55)" },
        { category: "احادیث", arabic: "مَنْ لَا يَشْكُرُ النَّاسَ لَا يَشْكُرُ اللَّهَ", translation: "جو لوگوں کا شکر ادا نہیں کرتا، وہ اللہ کا شکر بھی ادا نہیں کرتا۔ (سنن ترمذی: 1954)" },
        { category: "احادیث", arabic: "خَيْرُكُمْ مَنْ تَعَلَّمَ الْقُرْآنَ وَعَلَّمَهُ", translation: "تم میں سب سے بہتر وہ ہے جو قرآن سیکھے اور سکھائے۔ (صحیح بخاری: 5027)" },
        { category: "احادیث", arabic: "مَنْ سَلَكَ طَرِيقًا يَلْتَمِسُ فِيهِ عِلْمًا سَهَّلَ اللَّهُ لَهُ بِهِ طَرِيقًا إِلَى الْجَنَّةِ", translation: "جو شخص علم حاصل کرنے کے لیے راستہ اختیار کرے، اللہ اس کے لیے جنت کا راستہ آسان کر دیتا ہے۔ (صحیح مسلم: 2699)" },
        { category: "احادیث", arabic: "لَا تَحَاسَدُوا وَلَا تَنَاجَشُوا وَلَا تَبَاغَضُوا", translation: "نہ حسد کرو، نہ دھوکہ دو، اور نہ ایک دوسرے سے نفرت کرو۔ (صحیح مسلم: 2564)" },
        { category: "احادیث", arabic: "مَنْ كَانَ يُؤْمِنُ بِاللَّهِ وَالْيَوْمِ الْآخِرِ فَلْيَقُلْ خَيْرًا أَوْ لِيَصْمُتْ", translation: "جو اللہ اور آخرت پر ایمان رکھتا ہو، وہ بھلائی کی بات کہے یا خاموش رہے۔ (صحیح بخاری: 6018)" },
        { category: "احادیث", arabic: "الطُّهُورُ شَطْرُ الْإِيمَانِ", translation: "پاکیزگی ایمان کا نصف ہے۔ (صحیح مسلم: 223)" },
        { category: "احادیث", arabic: "إِذَا مَاتَ الْإِنْسَانُ انْقَطَعَ عَنْهُ عَمَلُهُ إِلَّا مِنْ ثَلَاثٍ", translation: "جب انسان مر جاتا ہے تو اس کا عمل بند ہو جاتا ہے سوائے تین چیزوں کے: صدقہ جاریہ، نفع بخش علم، اور نیک اولاد جو اس کے لیے دعا کرے۔ (صحیح مسلم: 1631)" },
        { category: "احادیث", arabic: "مَنْ صَلَّى الْبَرْدَيْنِ دَخَلَ الْجَنَّةَ", translation: "جو شخص فجر اور عصر کی نمازیں پڑھتا ہے، وہ جنت میں داخل ہوگا۔ (صحیح بخاری: 574)" },
        { category: "احادیث", arabic: "لَا يُؤْمِنُ أَحَدُكُمْ حَتَّى يُحِبَّ لِأَخِيهِ مَا يُحِبُّ لِنَفْسِهِ", translation: "تم میں سے کوئی مومن نہیں ہو سکتا جب تک کہ اپنے بھائی کے لیے وہی نہ چاہے جو اپنے لیے چاہتا ہو۔ (صحیح بخاری: 13)" },
        { category: "احادیث", arabic: "مَنْ رَأَى مِنْكُمْ مُنْكَرًا فَلْيُغَيِّرْهُ بِيَدِهِ", translation: "تم میں سے جو شخص کوئی برائی دیکھے، اسے اپنے ہاتھ سے روکے، اگر نہ کر سکے تو زبان سے، اور اگر یہ بھی نہ کر سکے تو دل سے۔ (صحیح مسلم: 49)" },
        { category: "احادیث", arabic: "مَنْ حَفِظَ عَشْرَ آيَاتٍ مِنْ أَوَّلِ سُورَةِ الْكَهْفِ عُصِمَ مِنْ فِتْنَةِ الدَّجَّالِ", translation: "جو شخص سورہ کہف کی ابتدائی دس آیات حفظ کرے، وہ دجال کے فتنے سے محفوظ رہے گا۔ (صحیح مسلم: 809)" },
        { category: "احادیث", arabic: "مَنْ تَوَضَّأَ فَأَحْسَنَ الْوُضُوءَ ثُمَّ صَلَّى رَكْعَتَيْنِ غُفِرَ لَهُ مَا تَقَدَّمَ مِنْ ذَنْبِهِ", translation: "جو شخص اچھی طرح وضو کرے پھر دو رکعت نماز پڑھے، اس کے پچھلے گناہ معاف کر دیے جاتے ہیں۔ (صحیح بخاری: 159)" },
        { category: "احادیث", arabic: "الصَّدَقَةُ تُطْفِئُ الْخَطِيئَةَ كَمَا يُطْفِئُ الْمَاءُ النَّارَ", translation: "صدقہ گناہوں کو اسی طرح بجھاتا ہے جیسے پانی آگ کو بجھاتا ہے۔ (سنن ترمذی: 614)" },
        { category: "احادیث", arabic: "مَنْ قَالَ سُبْحَانَ اللَّهِ وَبِحَمْدِهِ فِي يَوْمٍ مِائَةَ مَرَّةٍ حُطَّتْ خَطَايَاهُ", translation: "جو شخص ایک دن میں سو بار 'سبحان اللہ وبحمدہ' کہے، اس کے گناہ مٹا دیے جاتے ہیں۔ (صحیح مسلم: 2691)" },
        { category: "احادیث", arabic: "مَنْ صَلَّى عَلَيَّ صَلَاةً صَلَّى اللَّهُ عَلَيْهِ عَشْرًا", translation: "جو شخص مجھ پر ایک بار درود پڑھے، اللہ اس پر دس رحمتیں نازل کرتا ہے۔ (صحیح مسلم: 408)" },
        { category: "احادیث", arabic: "اتَّقِ اللَّهَ حَيْثُمَا كُنْتَ", translation: "جہاں بھی ہو، اللہ سے ڈر۔ (سنن ترمذی: 1987)" },
        { category: "احادیث", arabic: "مَنْ كَذَبَ عَلَيَّ مُتَعَمِّدًا فَلْيَتَبَوَّأْ مَقْعَدَهُ مِنَ النَّارِ", translation: "جو شخص جان بوجھ کر مجھ پر جھوٹ باندھے، وہ اپنا ٹھکانہ جہنم میں بنائے۔ (صحیح بخاری: 107)" },
        { category: "احادیث", arabic: "الْمُسْلِمُ مَنْ سَلِمَ الْمُسْلِمُونَ مِنْ لِسَانِهِ وَيَدِهِ", translation: "مسلمان وہ ہے جس کی زبان اور ہاتھ سے دوسرے مسلمان محفوظ رہیں۔ (صحیح بخاری: 10)" },
        { category: "احادیث", arabic: "مَنْ غَشَّنَا فَلَيْسَ مِنَّا", translation: "جو ہمارے ساتھ دھوکہ کرے، وہ ہم میں سے نہیں ہے۔ (صحیح مسلم: 101)" },
        { category: "احادیث", arabic: "مَنْ أَحَبَّ لِقَاءَ اللَّهِ أَحَبَّ اللَّهُ لِقَاءَهُ", translation: "جو شخص اللہ سے ملاقات کو پسند کرتا ہے، اللہ بھی اس سے ملاقات کو پسند کرتا ہے۔ (صحیح بخاری: 6507)" },
        { category: "احادیث", arabic: "لَا تَدْخُلُونَ الْجَنَّةَ حَتَّى تُؤْمِنُوا وَلَا تُؤْمِنُوا حَتَّى تَحَابُّوا", translation: "تم جنت میں داخل نہیں ہو سکتے جب تک ایمان نہ لاؤ، اور ایمان نہیں لا سکتے جب تک ایک دوسرے سے محبت نہ کرو۔ (صحیح مسلم: 54)" },
        { category: "احادیث", arabic: "مَنْ رَدَّ عَنْ عِرْضِ أَخِيهِ رَدَّ اللَّهُ عَنْ وَجْهِهِ النَّارَ", translation: "جو شخص اپنے بھائی کی عزت کی حفاظت کرے، اللہ اس کے چہرے کو جہنم کی آگ سے بچائے گا۔ (سنن ترمذی: 1931)" },
        { category: "احادیث", arabic: "إِنَّ اللَّهَ يُحِبُّ الْعَبْدَ التَّقِيَّ النَّقِيَّ الْخَفِيَّ", translation: "اللہ اس بندے سے محبت کرتا ہے جو متقی، پاکیزہ اور گمنام ہو۔ (صحیح مسلم: 2965)" },
        { category: "احادیث", arabic: "مَنْ أَكَلَ طَعَامًا فَقَالَ الْحَمْدُ لِلَّهِ الَّذِي أَطْعَمَنِي هَذَا غُفِرَ لَهُ مَا تَقَدَّمَ مِنْ ذَنْبِهِ", translation: "جو شخص کھانا کھانے کے بعد 'الحمد للہ الذی اطعمنی ھذا' کہے، اس کے پچھلے گناہ معاف کر دیے جاتے ہیں۔ (سنن ابو داؤد: 4023)" },
        { category: "احادیث", arabic: "مَنْ تَرَكَ الصَّلَاةَ مُتَعَمِّدًا فَقَدْ كَفَرَ", translation: "جو شخص جان بوجھ کر نماز چھوڑ دے، اس نے کفر کیا۔ (سنن نسائی: 463)" },
        { category: "احادیث", arabic: "خَيْرُ الصَّحَابَةِ أَرْبَعَةٌ", translation: "بہترین صحابہ چار ہیں۔ (صحیح بخاری: 3674)" },
        { category: "احادیث", arabic: "إِنَّ أَحَبَّ الْأَعْمَالِ إِلَى اللَّهِ أَدْوَمُهَا وَإِنْ قَلَّ", translation: "اللہ کو سب سے زیادہ پسندیدہ عمل وہ ہے جو مستقل ہو، خواہ کم ہو۔ (صحیح بخاری: 6461)" },
        { category: "احادیث", arabic: "مَنْ عَادَ مَرِيضًا أَوْ زَارَ أَخًا فِي اللَّهِ نَادَاهُ مُنَادٍ أَنْ طِبْتَ", translation: "جو شخص بیمار کی عیادت کرے یا اللہ کی رضا کے لیے بھائی سے ملے، اسے ایک پکارنے والا پکارتا ہے کہ تو پاکیزہ ہو گیا۔ (سنن ترمذی: 2008)" },
        { category: "احادیث", arabic: "مَنْ أَذَّنَ اثْنَتَيْ عَشْرَةَ سَنَةً وَجَبَتْ لَهُ الْجَنَّةُ", translation: "جو شخص بارہ سال تک اذان دیتا رہے، اس کے لیے جنت واجب ہو جاتی ہے۔ (سنن ابن ماجہ: 708)" },
        { category: "احادیث", arabic: "إِنَّ اللَّهَ لَا يَنْظُرُ إِلَى صُوَرِكُمْ وَأَمْوَالِكُمْ وَلَكِنْ يَنْظُرُ إِلَى قُلُوبِكُمْ وَأَعْمَالِكُمْ", translation: "اللہ تمہاری صورتوں اور مال کو نہیں دیکھتا، بلکہ تمہارے دلوں اور اعمال کو دیکھتا ہے۔ (صحیح مسلم: 2564)" },
        { category: "احادیث", arabic: "مَنْ أَحْيَا سُنَّةً مِنْ سُنَّتِي فَلَهُ أَجْرُ مِائَةِ شَهِيدٍ", translation: "جو شخص میری سنت کو زندہ کرے، اسے سو شہیدوں کا اجر ملے گا۔ (المعجم الأوسط للطبرانی: 6505)" },
        { category: "احادیث", arabic: "مَنْ قَالَ لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ مُخْلِصًا دَخَلَ الْجَنَّةَ", translation: "جو شخص خلوص کے ساتھ 'لا إله إلا الله وحده لا شریک له' کہے، وہ جنت میں داخل ہوگا۔ (مسند احمد: 1592)" },
        { category: "احادیث", arabic: "مَنْ صَلَّى قَبْلَ الظُّهْرِ أَرْبَعًا وَبَعْدَهَا أَرْبَعًا حَرَّمَهُ اللَّهُ عَلَى النَّارِ", translation: "جو شخص ظہر سے پہلے اور بعد میں چار چار رکعت پڑھے، اللہ اسے جہنم کی آگ سے حرام کر دیتا ہے۔ (سنن ترمذی: 427)" },
        { category: "احادیث", arabic: "إِنَّ أَوَّلَ مَا يُحَاسَبُ بِهِ الْعَبْدُ صَلَاتُهُ", translation: "سب سے پہلے بندے سے اس کی نماز کا حساب لیا جائے گا۔ (سنن نسائی: 465)" },
        { category: "احادیث", arabic: "مَنْ أَكْرَمَ يَتِيمًا كَانَ مَعِي فِي الْجَنَّةِ", translation: "جو شخص یتیم کی عزت کرے، وہ جنت میں میرے ساتھ ہوگا۔ (صحیح بخاری: 6005)" },
        { category: "احادیث", arabic: "إِنَّ اللَّهَ يُحِبُّ مَنْ كَانَ رَفِيقًا لَيِّنًا", translation: "اللہ اس شخص سے محبت کرتا ہے جو نرمی اور رفق سے کام لے۔ (مسند احمد: 24380)" }
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
    if (duaCategoriesContainer.firstChild) {
        duaCategoriesContainer.firstChild.classList.add('active');
    }
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

function displayNames(names) {
    namesContainer.innerHTML = '';
    names.forEach(name => {
        const nameCard = document.createElement('div');
        nameCard.className = 'name-card';
        nameCard.innerHTML = `<p class="name-arabic">${name.name}</p><p class="name-translation">${name.transliteration} - ${name.ur_meaning}</p>`;
        namesContainer.appendChild(nameCard);
    });
}

showNamesBtn.addEventListener('click', () => openModal('names-modal'));
showNamesBtnMore.addEventListener('click', () => openModal('names-modal'));

// --- Initial Load ---
document.addEventListener('DOMContentLoaded', () => {
    fetchSurahList();
    loadContentData();
    showPage('homeCustomPage');
    updateTarget();
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(position => {
            getPrayerTimes(position.coords.latitude, position.coords.longitude);
        }, () => { prayerTimeLoader.textContent = "لوکیشن کی اجازت درکار ہے۔"; });
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
