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
const dailyDuaContainer = document.getElementById('daily-dua-container');
const prayerTimeLoader = document.getElementById('prayer-time-loader');
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

// --- Home Page Functionality ---
const dailyAyahs = [
    { arabic: "فَبِأَيِّ آلَاءِ رَبِّكُمَا تُكَذِّبَانِ", translation: "پس تم اپنے رب کی کون کون سی نعمتوں کو جھٹلاؤ گے؟" },
    { arabic: "إِنَّ مَعَ الْعُسْرِ يُسْرًا", translation: "بے شک ہر مشکل کے ساتھ آسانی ہے۔" },
    { arabic: "وَمَنْ يَتَوَكَّلْ عَلَى اللَّهِ فَهُوَ حَسْبُهُ", translation: "اور جو اللہ پر بھروسہ کرتا ہے، تو وہ اس کے لیے کافی ہے۔" },
    { arabic: "قُلْ هُوَ اللَّهُ أَحَدٌ", translation: "کہہ دو کہ وہ اللہ ایک ہے۔" },
    { arabic: "اللَّهُ الصَّمَدُ", translation: "اللہ سب سے بے نیاز ہے۔" }
];

const dailyDuas = [
    { arabic: "اَللّٰھُمَّ اِنِّیْ اَسْئَلُکَ الْعَفْوَ وَالْعَافِیَةَ فِی الدُّنْیَا وَالْآخِرَةِ", translation: "اے اللہ! میں تجھ سے دنیا اور آخرت میں معافی اور عافیت مانگتا ہوں۔" },
    { arabic: "رَبَّنَا آتِنَا فِی الدُّنْیَا حَسَنَةً وَّفِی الْآخِرَةِ حَسَنَةً وَّقِنَا عَذَابَ النَّارِ", translation: "اے ہمارے رب! ہمیں دنیا میں بھلائی عطا فرما اور آخرت میں بھلائی عطا فرما اور ہمیں آگ کے عذاب سے بچا۔" },
    { arabic: "اَللّٰھُمَّ اِنِّیْ اَسْئَلُکَ الْجَنَّةَ وَمَا قَرَّبَ إِلَیْہَا مِنْ قَوْلٍ اَوْ عَمَلٍ", translation: "اے اللہ! میں تجھ سے جنت اور اس کی طرف لے جانے والے قول یا عمل مانگتا ہوں۔" },
    { arabic: "اَللّٰھُمَّ اغْفِرْ لِیْ وَلِوَالِدَیَّ وَارْحَمْہُمَا", translation: "اے اللہ! مجھے اور میرے والدین کو معاف فرما اور ان پر رحم فرما۔" },
    { arabic: "رَبَّنَا تَقَبَّلْ مِنَّا إِنَّكَ أَنْتَ السَّمِیعُ الْعَلِیْمُ", translation: "اے ہمارے رب! ہم سے قبول فرما، بے شک تو سننے والا اور جاننے والا ہے۔" },
    { arabic: "اَللّٰھُمَّ إِنِّی أَعُوذُ بِكَ مِنْ الْهَمِّ وَالْحَزَنِ", translation: "اے اللہ! میں تیری پناہ مانگتا ہوں غم اور دکھ سے۔" },
    { arabic: "اَللّٰھُمَّ رَحْمَتَكَ أَرْجُوْ فَلَا تَكِلْنِیْ إِلَى نَفْسِیْ طَرْفَةَ عَیْنٍ", translation: "اے اللہ! میں تیری رحمت کی امید رکھتا ہوں، تو مجھے آنکھ کی پلک جھپکنے کے لیے بھی اپنے حال پر نہ چھوڑ۔" },
    { arabic: "اَللّٰھُمَّ بَارِكْ لِیْ فِیْ مَا رَزَقْتَنِیْ", translation: "اے اللہ! جو تو نے مجھے رزق دیا، اس میں برکت عطا فرما۔" },
    { arabic: "رَبَّنَا آتِنَا مِنْ لَدُنْكَ رَحْمَةً وَهَیِّئْ لَنَا مِنْ أَمْرِنَا رَشَدًا", translation: "اے ہمارے رب! ہمیں تیری طرف سے رحمت عطا فرما اور ہمارے کاموں کے لیے ہدایت ترتیب دے۔" },
    { arabic: "اَللّٰھُمَّ افْتَحْ لِیْ أَبْوَابَ رَحْمَتِكَ", translation: "اے اللہ! میرے لیے اپنی رحمت کے دروازے کھول۔" },
    { arabic: "اَللّٰھُمَّ اغْفِرْ لِیْ ذَنْبِیْ كُلَّهُ", translation: "اے اللہ! میرے تمام گناہوں کو معاف فرما۔" },
    { arabic: "رَبَّنَا لَا تُؤَاخِذْنَا إِنْ نَسِیْنَا أَوْ أَخْطَأْنَا", translation: "اے ہمارے رب! اگر ہم بھول گئے یا غلطی کر بیٹھے تو ہمیں اس کا حساب نہ لینا۔" },
    { arabic: "اَللّٰھُمَّ إِنِّی أَسْئَلُكَ الْهُدَى وَالتُّقَى", translation: "اے اللہ! میں تجھ سے ہدایت اور تقویٰ مانگتا ہوں۔" },
    { arabic: "اَللّٰھُمَّ اجْعَلْنِیْ مِنَ الَّذِیْنَ یَسْتَمِعُوْنَ الْقَوْلَ فَیَتَّبِعُوْنَ أَحْسَنَهُ", translation: "اے اللہ! مجھے ان میں سے بنا جو بات سن کر اس کا بہترین انتخاب کرتے ہیں۔" },
    { arabic: "رَبَّنَا اغْفِرْ لَنَا ذُنُوْبَنَا وَكَفَّرْ عَنَّا سَیِّئَاتِنَا", translation: "اے ہمارے رب! ہمارے گناہوں کو معاف فرما اور ہماری برائیوں کو مٹا دے۔" },
    { arabic: "اَللّٰھُمَّ عَافِنِیْ فِیْ بَدَنِیْ", translation: "اے اللہ! میرے جسم کو عافیت دے۔" },
    { arabic: "رَبَّنَا آتِنَا وَأَنْتَ خَیْرُ الْعَاطِیْنَ", translation: "اے ہمارے رب! ہمیں عطا فرما، اور تو بہترین عطا کرنے والا ہے۔" },
    { arabic: "اَللّٰھُمَّ إِنِّی أَعُوذُ بِكَ مِنْ عَذَابِ الْقَبْرِ", translation: "اے اللہ! میں تیری پناہ مانگتا ہوں قبر کے عذاب سے۔" },
    { arabic: "اَللّٰھُمَّ إِجْعَلْنِیْ مِنَ الْشُّهَدَاءِ", translation: "اے اللہ! مجھے شہدا میں شامل فرما۔" },
    { arabic: "رَبَّنَا لَا تَجْعَلْنَا فِتْنَةً لِّلَّذِیْنَ كَفَرُوْا", translation: "اے ہمارے رب! ہمیں کافروں کے لیے فتنہ نہ بنا۔" },
    { arabic: "اَللّٰھُمَّ رَبَّنَا تَقَبَّلْ تَوْبَتَنَا", translation: "اے ہمارے رب! ہماری توبہ قبول فرما۔" },
    { arabic: "اَللّٰھُمَّ إِنِّی أَسْئَلُكَ الْعِزَّ فِیْ عَافِیَتِكَ", translation: "اے اللہ! میں تیری عافیت میں عزت مانگتا ہوں۔" },
    { arabic: "رَبَّنَا اغْفِرْ لِیْ وَلِوَالِدَیَّ وَلِلْمُؤْمِنِیْنَ", translation: "اے ہمارے رب! مجھے، میرے والدین کو، اور مومنوں کو معاف فرما۔" },
    { arabic: "اَللّٰھُمَّ إِنِّی أَعُوذُ بِكَ مِنَ الْفَقْرِ", translation: "اے اللہ! میں تیری پناہ مانگتا ہوں غربت سے۔" },
    { arabic: "رَبَّنَا لَا تُزِغْ قُلُوْبَنَا بَعْدَ إِذْ هَدَیْتَنَا", translation: "اے ہمارے رب! جب تو نے ہمیں ہدایت دی تو ہمارے دلوں کو نہ ڈال۔" },
    { arabic: "اَللّٰھُمَّ إِجْعَلْنِیْ مِنَ الصّٰبِرِیْنَ", translation: "اے اللہ! مجھے صبر کرنے والوں میں شامل فرما۔" },
    { arabic: "رَبَّنَا اسْتَغْفِرْ لَنَا ذُنُوْبَنَا وَإِخْوَانِنَا", translation: "اے ہمارے رب! ہمارے اور ہمارے بھائیوں کے گناہ معاف فرما۔" },
    { arabic: "اَللّٰھُمَّ إِنِّی أَسْئَلُكَ الْجَنَّةَ وَأَعُوْذُ بِكَ مِنَ النَّارِ", translation: "اے اللہ! میں جنت مانگتا ہوں اور آگ سے تیری پناہ مانگتا ہوں۔" },
    { arabic: "رَبَّنَا تَرَبَّصْنَا إِلَیْكَ", translation: "اے ہمارے رب! ہم تیری طرف رجوع کرتے ہیں۔" },
    { arabic: "اَللّٰھُمَّ اغْنِنِیْ بِحَلَالِكَ عَنْ حَرَامِكَ", translation: "اے اللہ! اپنے حلال سے میری حاجت پوری فرما تاکہ میں حرام سے بچوں۔" },
    { arabic: "رَبَّنَا افْتَحْ بَیْنَنَا وَبَیْنَ قَوْمِنَا بِالْحَقِّ", translation: "اے ہمارے رب! ہم اور ہمارے قوم کے درمیان حق سے فیصلہ فرما۔" },
    { arabic: "اَللّٰھُمَّ إِنِّی أَسْئَلُكَ الْفِرَاسَةَ فِی الدِّیْنِ", translation: "اے اللہ! میں تیری طرف سے دین میں فہم و بصیرت مانگتا ہوں۔" },
    { arabic: "رَبَّنَا عَلَیْكَ تَوَكَّلْنَا", translation: "اے ہمارے رب! ہم نے تیری طرف بھروسہ کیا۔" },
    { arabic: "اَللّٰھُمَّ إِجْعَلْنِیْ مِنَ الْمُقِیْمِیْنَ الصَّلَاةَ", translation: "اے اللہ! مجھے نماز قائم کرنے والوں میں شامل فرما۔" },
    { arabic: "رَبَّنَا أَفْرِغْ عَلَیْنَا صَبْرًا", translation: "اے ہمارے رب! ہم پر صبر نازل فرما۔" },
    { arabic: "اَللّٰھُمَّ إِنِّی أَعُوذُ بِكَ مِنْ زَوَالِ نِعْمَتِكَ", translation: "اے اللہ! میں تیری نعمتوں کے زوال سے تیری پناہ مانگتا ہوں۔" },
    { arabic: "رَبَّنَا لَا تَجْعَلْنَا مَعَ الْقَوْمِ الظّٰلِمِیْنَ", translation: "اے ہمارے رب! ہمیں ظالموں کے ساتھ نہ رکھ۔" },
    { arabic: "اَللّٰھُمَّ إِنِّی أَسْئَلُكَ الْعِزَّ فِی الْعَافِیَةِ", translation: "اے اللہ! میں عافیت میں عزت مانگتا ہوں۔" },
    { arabic: "رَبَّنَا آتِنَا مِنْ بَیْنِ أَیْدِیْنَا وَمِنْ خَلْفِنَا", translation: "اے ہمارے رب! ہمیں آگے اور پیچھے سے عطا فرما۔" },
    { arabic: "اَللّٰھُمَّ إِجْعَلْنِیْ مِنَ الْمُحْسِنِیْنَ", translation: "اے اللہ! مجھے نیکی کرنے والوں میں شامل فرما۔" },
    { arabic: "رَبَّنَا اغْفِرْ لَنَا وَلِإِخْوَانِنَا الَّذِیْنَ سَبَقُوْنَا بِالْإِیْمَانِ", translation: "اے ہمارے رب! ہمیں اور ان بھائیوں کو معاف فرما جو ہم سے پہلے ایمان لائے۔" },
    { arabic: "اَللّٰھُمَّ إِنِّی أَعُوذُ بِكَ مِنْ شَرِّ نَفْسِیْ", translation: "اے اللہ! میں اپنی نفس کے شر سے تیری پناہ مانگتا ہوں۔" },
    { arabic: "رَبَّنَا تَوَفَّنَا مَعَ الْأَبْرَارِ", translation: "اے ہمارے رب! ہمیں نیکوکاروں کے ساتھ وفات دے۔" },
    { arabic: "اَللّٰھُمَّ إِنِّی أَسْئَلُكَ الْعِلْمَ النَّافِعَ", translation: "اے اللہ! میں تجھ سے نفع بخش علم مانگتا ہوں۔" },
    { arabic: "رَبَّنَا وَاجْعَلْنَا مُسْلِمَیْنِ لَكَ", translation: "اے ہمارے رب! ہمیں تیری طرف سے مسلم بنا۔" },
    { arabic: "اَللّٰھُمَّ إِجْعَلْنِیْ مِنَ الْمُقَرَّبِیْنَ", translation: "اے اللہ! مجھے مقربین میں شامل فرما۔" },
    { arabic: "رَبَّنَا اسْتَعِيْنْ بِكَ عَلَى الْكُفَّارِ", translation: "اے ہمارے رب! کافروں کے مقابلے میں تیری مدد مانگتے ہیں۔" },
    { arabic: "اَللّٰھُمَّ إِنِّی أَعُوذُ بِكَ مِنْ عَذَابِ یَوْمِ الْقِیَامَةِ", translation: "اے اللہ! میں قیامت کے دن کے عذاب سے تیری پناہ مانگتا ہوں۔" },
    { arabic: "رَبَّنَا أَدْخِلْنَا دَارَ السَّلَامِ", translation: "اے ہمارے رب! ہمیں امن کے گھر میں داخل فرما۔" },
    { arabic: "اَللّٰھُمَّ إِجْعَلْنِیْ مِنَ الْمُتَّقِیْنَ", translation: "اے اللہ! مجھے متقیوں میں شامل فرما۔" },
    { arabic: "رَبَّنَا تَمَّتْ كَلِمَتُكَ فِیْ خَلْقِكَ", translation: "اے ہمارے رب! تیری بات تیری مخلوق میں مکمل ہوگئی۔" },
    { arabic: "اَللّٰھُمَّ إِنِّی أَسْئَلُكَ الرِّضَاةَ بَعْدَ الْقَضَاءِ", translation: "اے اللہ! میں تیری رضا پسند کرنے کے بعد فیصلہ مانگتا ہوں۔" },
    { arabic: "رَبَّنَا اصْرِفْ عَنَّا عَذَابَ جَهَنَّمَ", translation: "اے ہمارے رب! ہمیں جہنم کے عذاب سے دور رکھ۔" },
    { arabic: "اَللّٰھُمَّ إِجْعَلْنِیْ مِنَ الْمُصَلِّیْنَ", translation: "اے اللہ! مجھے نماز پڑھنے والوں میں شامل فرما۔" },
    { arabic: "رَبَّنَا إِنَّكَ جَامِعُ النَّاسِ لِیَوْمٍ لَّا رَیْبَ فِیْهِ", translation: "اے ہمارے رب! تو لوگوں کو اس دن اکٹھا کرنے والا ہے جس میں کوئی شک نہیں۔" },
    { arabic: "اَللّٰھُمَّ إِنِّی أَعُوذُ بِكَ مِنْ الْجُحُودِ", translation: "اے اللہ! میں کفر سے تیری پناہ مانگتا ہوں۔" },
    { arabic: "رَبَّنَا وَابْعَثْ فِیْهِمْ رَسُوْلًا", translation: "اے ہمارے رب! ان میں ایک رسول بھیج۔" },
    { arabic: "اَللّٰھُمَّ إِجْعَلْنِیْ مِنَ الْمُتَوَكِّلِیْنَ", translation: "اے اللہ! مجھے بھروسہ کرنے والوں میں شامل فرما۔" },
    { arabic: "رَبَّنَا لَا تُكَلِّفْنَا مَا لَا طَاقَةَ لَنَا بِهِ", translation: "اے ہمارے رب! ہمیں وہ بوجھ نہ دو جو ہماری طاقت سے باہر ہو۔" },
    { arabic: "اَللّٰھُمَّ إِنِّی أَسْئَلُكَ الْحَیَاةَ الطَّیِّبَةَ", translation: "اے اللہ! میں تیری طرف سے پاک زندگی مانگتا ہوں۔" },
    { arabic: "رَبَّنَا أَتْمِمْ لَنَا نُوْرَنَا", translation: "اے ہمارے رب! ہمارا نور مکمل فرما۔" },
    { arabic: "اَللّٰھُمَّ إِجْعَلْنِیْ مِنَ الْمُحْسِنِیْنَ", translation: "اے اللہ! مجھے نیکی کرنے والوں میں شامل فرما۔" },
    { arabic: "رَبَّنَا اغْفِرْ لَنَا وَلِمَنْ تَقَدَّمَنَا", translation: "اے ہمارے رب! ہمیں اور ہم سے پہلے والوں کو معاف فرما۔" },
    { arabic: "اَللّٰھُمَّ إِنِّی أَعُوذُ بِكَ مِنْ شَرِّ الشَّیْطَانِ", translation: "اے اللہ! میں شیطان کے شر سے تیری پناہ مانگتا ہوں۔" },
    { arabic: "رَبَّنَا إِنَّكَ تَعْلَمُ مَا نُخْفِیْ وَمَا نُعْلِنُ", translation: "اے ہمارے رب! تو جانتا ہے جو ہم چھپاتے ہیں اور جو ظاہر کرتے ہیں۔" },
    { arabic: "اَللّٰھُمَّ إِجْعَلْنِیْ مِنَ الْمُتَوَفِّیْنَ عَلَی الْإِسْلَامِ", translation: "اے اللہ! مجھے اسلام پر وفات دینے والوں میں شامل فرما۔" },
    { arabic: "رَبَّنَا أَعُوْذُ بِكَ مِنْ فِتْنَةِ الْمَحْیَا وَالْمَمَاتِ", translation: "اے ہمارے رب! زندگی اور موت کی فتنہ سے تیری پناہ مانگتے ہیں۔" },
    { arabic: "اَللّٰھُمَّ إِنِّی أَسْئَلُكَ الْقُوَّةَ فِی الْإِیْمَانِ", translation: "اے اللہ! میں ایمان میں قوت مانگتا ہوں۔" },
    { arabic: "رَبَّنَا لَا تُحَمِّلْنَا إِلَّا مَا أَطَقْنَا", translation: "اے ہمارے رب! ہمیں صرف اتنا بوجھ دے جو ہم برداشت کر سکیں۔" },
    { arabic: "اَللّٰھُمَّ إِجْعَلْنِیْ مِنَ الْمُسْتَغْفِرِیْنَ", translation: "اے اللہ! مجھے استغفار کرنے والوں میں شامل فرما۔" },
    { arabic: "رَبَّنَا أَنْتَ مَوْلَانَا", translation: "اے ہمارے رب! تو ہمارا مالک ہے۔" },
    { arabic: "اَللّٰھُمَّ إِنِّی أَعُوذُ بِكَ مِنْ عَذَابِ الْقَبْرِ وَمِنْ فِتْنَةِ الدَّجَّالِ", translation: "اے اللہ! میں قبر کے عذاب اور دجال کی فتنہ سے تیری پناہ مانگتا ہوں۔" },
    { arabic: "رَبَّنَا اسْتَجِرْ بِنَا وَلَا تَجْعَلْنَا فِیْ ضَلَالٍ", translation: "اے ہمارے رب! ہمیں مدد فرما اور ہمیں گمراہی میں نہ ڈال۔" },
    { arabic: "اَللّٰھُمَّ إِجْعَلْنِیْ مِنَ الْمُتَوَكِّلِیْنَ عَلَیْكَ", translation: "اے اللہ! مجھے تیپ پر بھروسہ کرنے والوں میں شامل فرما۔" },
    { arabic: "رَبَّنَا اغْفِرْ لَنَا مَا قَدَّمْنَا وَمَا أَخَّرْنَا", translation: "اے ہمارے رب! جو ہم نے پہلے کیا اور جو بعد میں کیا، سب معاف فرما۔" },
    { arabic: "اَللّٰھُمَّ إِنِّی أَسْئَلُكَ الْفَضْلَ فِی الْعَطَاءِ", translation: "اے اللہ! میں تیری طرف سے عطا میں فضل مانگتا ہوں۔" },
    { arabic: "رَبَّنَا تَوَفَّنَا مُسْلِمِیْنَ", translation: "اے ہمارے رب! ہمیں مسلم بنا کر وفات دے۔" },
    { arabic: "اَللّٰھُمَّ إِجْعَلْنِیْ مِنَ الْمُتَقِیْنَ فِی الْخَفَاءِ", translation: "اے اللہ! مجھے پوشیدہ میں متقیوں میں شامل فرما۔" },
    { arabic: "رَبَّنَا أَعُوْذُ بِكَ مِنْ شَرِّ مَا عَمِلْنَا", translation: "اے ہمارے رب! ہم نے جو کچھ کیا، اس کے شر سے تیری پناہ مانگتے ہیں۔" },
    { arabic: "اَللّٰھُمَّ إِنِّی أَعُوذُ بِكَ مِنْ عَذَابِ الْجَهَنَّمِ", translation: "اے اللہ! میں جہنم کے عذاب سے تیری پناہ مانگتا ہوں۔" },
    { arabic: "رَبَّنَا وَتَقَبَّلْ دُعَاءَ", translation: "اے ہمارے رب! ہماری دعا قبول فرما۔" },
    { arabic: "اَللّٰھُمَّ إِجْعَلْنِیْ مِنَ الْمُقَرَّبِیْنَ إِلَیْكَ", translation: "اے اللہ! مجھے تیری طرف مقربین میں شامل فرما۔" },
    { arabic: "رَبَّنَا لَا تَجْعَلْنَا مَعَ الْمُفْسِدِیْنَ", translation: "اے ہمارے رب! ہمیں مفسدوں کے ساتھ نہ رکھ۔" },
    { arabic: "اَللّٰھُمَّ إِنِّی أَسْئَلُكَ الْقُبُوْلَ فِی الْعَمَلِ", translation: "اے اللہ! میں اپنے اعمال میں قبولیت مانگتا ہوں۔" },
    { arabic: "رَبَّنَا أَعُوْذُ بِكَ مِنْ عَذَابِ الْقَبْرِ وَمِنْ فِتْنَةِ الْمَسِیْحِ الدَّجَّالِ", translation: "اے ہمارے رب! قبر کے عذاب اور دجال کی فتنہ سے تیری پناہ مانگتے ہیں۔" },
    { arabic: "اَللّٰھُمَّ إِجْعَلْنِیْ مِنَ الْمُتَوَفِّیْنَ عَلَی الْإِیْمَانِ", translation: "اے اللہ! مجھے ایمان پر وفات دینے والوں میں شامل فرما۔" },
    { arabic: "رَبَّنَا لَا تُزِغْ قُلُوْبَنَا بَعْدَ إِذْ هَدَیْتَنَا وَهَبْ لَنَا مِنْ لَّدُنْكَ رَحْمَةً", translation: "اے ہمارے رب! جب تو نے ہمیں ہدایت دی تو ہمارے دلوں کو نہ ڈال اور ہمیں تیری رحمت عطا فرما۔" },
    { arabic: "اَللّٰھُمَّ إِنِّی أَعُوذُ بِكَ مِنْ جَمِیْعِ الْمَكْرُوْهِ", translation: "اے اللہ! میں سب طرح کے ناخوشگوار چیزوں سے تیری پناہ مانگتا ہوں۔" },
    { arabic: "اَللّٰھُمَّ إِجْعَلْنِیْ مِنَ الْمُتَوَفِّیْنَ عَلَی الْإِسْلَامِ", translation: "اے اللہ! مجھے اسلام پر وفات دینے والوں میں شامل فرما۔" }
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

function showRandomDua() {
    const randomIndex = Math.floor(Math.random() * dailyDuas.length);
    const dua = dailyDuas[randomIndex];
    dailyDuaContainer.innerHTML = `<p class="dua-arabic">${dua.arabic}</p><p class="dua-translation">${dua.translation}</p>`;
}

// --- Dua, Kalma, Hadith & 99 Names Data & Functionality ---
const allContent = [
    // 6 Kalmas
    { category: "6 کلمے", arabic: "لَا إِلَهَ إِلَّا اللَّهُ مُحَمَّدٌ رَسُولُ اللَّهِ", translation: "کوئی معبود نہیں سوائے اللہ کے، محمد صلی اللہ علیہ وسلم اللہ کے رسول ہیں۔" },
    { category: "6 کلمے", arabic: "أَشْهَدُ أَنْ لَا إِلَهَ إِلَّا اللَّهُ وَأَشْهَدُ أَنَّ مُحَمَّدًا عَبْدُهُ وَرَسُولُهُ", translation: "میں گواہی دیتا ہوں کہ کوئی معبود نہیں سوائے اللہ کے، اور میں گواہی دیتا ہوں کہ محمد صلی اللہ علیہ وسلم اس کے بندے اور رسول ہیں۔" },
    { category: "6 کلمے", arabic: "سُبْحَانَ اللَّهِ وَالْحَمْدُ لِلَّهِ وَلَا إِلَهَ إِلَّا اللَّهُ وَاللَّهُ أَكْبَرُ", translation: "اللہ پاک ہے، تمام تعریفیں اللہ کے لیے ہیں، کوئی معبود نہیں سوائے اللہ کے، اور اللہ سب سے بڑا ہے۔" },
    { category: "6 کلمے", arabic: "لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ يُحْيِي وَيُمِيتُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ", translation: "کوئی معبود نہیں سوائے اللہ کے، وہ اکیلا ہے، اس کا کوئی شریک نہیں، اسی کے لیے بادشاہی ہے اور اسی کے لیے حمد ہے، وہ زندہ کرتا ہے اور مارتا ہے، اور وہ ہر چیز پر قادر ہے۔" },
    { category: "6 کلمے", arabic: "أَسْتَغْفِرُ اللَّهَ رَبِّي مِنْ كُلِّ ذَنْبٍ وَأَتُوبُ إِلَيْهِ", translation: "میں اپنے رب اللہ سے ہر گناہ کی مغفرت مانگتا ہوں اور اس کی طرف توبہ کرتا ہوں۔" },
    { category: "6 کلمے", arabic: "اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنْ أَنْ أُشْرِكَ بِكَ شَيْئًا وَأَنَا أَعْلَمُ، وَأَسْتَغْفِرُكَ لِمَا لَا أَعْلَمُ", translation: "اے اللہ! میں تیری پناہ مانگتا ہوں اس سے کہ میں جانتے ہوئے تیرے ساتھ کسی کو شریک کروں، اور اس کے لیے مغفرت مانگتا ہوں جو میں نہیں جانتا۔" },
    
    // 40 Hadiths
    { category: "40 احادیث", arabic: "إِنَّمَا الأَعْمَالُ بِالنِّيَّاتِ", translation: "اعمال کا دارومدار نیتوں پر ہے۔ (صحیح بخاری: 1)" },
    { category: "40 احادیث", arabic: "مَنْ يُرِدِ اللَّهُ بِهِ خَيْرًا يُفَقِّهْهُ فِي الدِّينِ", translation: "جسے اللہ بھلائی چاہتا ہے، اسے دین میں سمجھ دیتا ہے۔ (صحیح بخاری: 71)" },
    { category: "40 احادیث", arabic: "مَنْ كَانَ يُؤْمِنُ بِاللَّهِ وَالْيَوْمِ الْآخِرِ فَلْيَقُلْ خَيْرًا أَوْ لِيَصْمُتْ", translation: "جو شخص اللہ اور قیامت کے دن پر ایمان رکھتا ہے، اسے بھلائی کہنی چاہیے یا خاموش رہنا چاہیے۔ (صحیح بخاری: 6018)" },
    { category: "40 احادیث", arabic: "الْمُسْلِمُ مَنْ سَلِمَ الْمُسْلِمُونَ مِنْ لِسَانِهِ وَيَدِهِ", translation: "مسلمان وہ ہے جس کے ہاتھ اور زبان سے دیگر مسلمان محفوظ ہوں۔ (صحیح بخاری: 10)" },
    { category: "40 احادیث", arabic: "لَا يُؤْمِنُ أَحَدُكُمْ حَتَّى يُحِبَّ لِأَخِيهِ مَا يُحِبُّ لِنَفْسِهِ", translation: "تم میں سے کوئی شخص مکمل ایمان نہیں رکھتا جب تک کہ وہ اپنے بھائی کے لیے وہی نہ چاہے جو اپنے لیے چاہتا ہے۔ (صحیح بخاری: 13)" },
    { category: "40 احادیث", arabic: "الْحَلَالُ بَيِّنٌ وَالْحَرَامُ بَيِّنٌ", translation: "حلال واضح ہے اور حرام بھی واضح ہے۔ (صحیح بخاری: 52)" },
    { category: "40 احادیث", arabic: "مَا نَهَيْتُكُمْ عَنْهُ فَاجْتَنِبُوهُ", translation: "جس چیز سے میں نے تمہیں منع کیا، اس سے بچو۔ (صحیح مسلم: 1735)" },
    { category: "40 احادیث", arabic: "الْمُؤْمِنُ الْقَوِيُّ خَيْرٌ وَأَحَبُّ إِلَى اللَّهِ مِنَ الْمُؤْمِنِ الضَّعِيفِ", translation: "مومن جو قوی ہے، وہ کمزور مومن سے بہتر اور اللہ کے نزدیک زیادہ محبوب ہے۔ (صحیح مسلم: 2664)" },
    { category: "40 احادیث", arabic: "مَنْ كَانَ يُؤْمِنُ بِاللَّهِ وَالْيَوْمِ الْآخِرِ فَلْيُكْرِمْ ضَيْفَهُ", translation: "جو اللہ اور قیامت کے دن پر ایمان رکھتا ہے، اسے اپنے مہمان کا احترام کرنا چاہیے۔ (صحیح بخاری: 6019)" },
    { category: "40 احادیث", arabic: "الْعَيْنَانِ تَزْنِيَانِ", translation: "آنکھیں زنا کرتی ہیں۔ (صحیح بخاری: 6243)" },
    { category: "40 احادیث", arabic: "الصَّدَقَةُ تُطْفِئُ الْخَطِيئَةَ كَمَا يُطْفِئُ الْمَاءُ النَّارَ", translation: "صدقہ گناہ کو اس طرح بجھاتا ہے جیسے پانی آگ کو بجھاتا ہے۔ (سنن ترمذی: 2541)" },
    { category: "40 احادیث", arabic: "مَنْ صَلَّى عَلَيَّ وَاحِدَةً صَلَّى اللَّهُ عَلَيْهِ عَشْرًا", translation: "جو شخص میری ایک بار درود و سلام بھیجے گا، اللہ اس پر دس مرتبہ درود بھیجے گا۔ (صحیح مسلم: 384)" },
    { category: "40 احادیث", arabic: "الْمُسْلِمُ أَخُو الْمُسْلِمِ", translation: "مسلمان، مسلمان کا بھائی ہے۔ (صحیح بخاری: 2442)" },
    { category: "40 احادیث", arabic: "الدُّنْيَا سِجْنُ الْمُؤْمِنِ", translation: "دنیا مومن کا جیل خانہ ہے۔ (صحیح مسلم: 2956)" },
    { category: "40 احادیث", arabic: "مَنْ حُبِبَ إِلَيْهِ قَوْلُ الْحَقِّ فَلْيَتَأَهَّلْ لِلْمَوْتِ", translation: "جسے سچ بولنا پسند ہو، وہ موت کے لیے تیار رہے۔ (سنن ابن ماجہ: 4250)" },
    { category: "40 احادیث", arabic: "مَنْ أَصْبَحَ مِنْكُمْ آمِنًا فِي سِرْبِهِ", translation: "جو شخص صبح کرے اور اپنے گھر میں امن میں ہو۔ (صحیح بخاری: 5928)" },
    { category: "40 احادیث", arabic: "إِنَّ اللَّهَ يُحِبُّ إِذَا عَمِلَ أَحَدُكُمْ عَمَلًا أَنْ يُتْقِنَهُ", translation: "اللہ اسے پسند کرتا ہے کہ جب تم میں سے کوئی کام کرے تو اسے اچھی طرح کرے۔ (سنن ابن ماجہ: 4108)" },
    { category: "40 احادیث", arabic: "الْكَيَّسُ مَنْ دَانَ نَفْسَهُ", translation: "عقلمند وہ ہے جو اپنی نفس کی خبر رکھے۔ (صحیح ترمذی: 2459)" },
    { category: "40 احادیث", arabic: "مَنْ سَعَدَ فِي الدُّنْيَا سَعِدَ فِي الْآخِرَةِ", translation: "جو دنیا میں کامیاب ہو، وہ آخرت میں بھی کامیاب ہوگا۔ (صحیح بخاری: 6511)" },
    { category: "40 احادیث", arabic: "الْمُسْتَقِيمُ مَنْ سَارَ عَلَى الْحَقِّ", translation: "سیدھا راستہ اس کا ہے جو حق پر چلے۔ (صحیح مسلم: 2556)" },
    { category: "40 احادیث", arabic: "إِيَّاكُمْ وَالْغَضَبَ", translation: "غصے سے بچو۔ (سنن ابن ماجہ: 4185)" },
    { category: "40 احادیث", arabic: "مَنْ صَلَّى الْعِشَاءَ فِي جَمَاعَةٍ", translation: "جو شخص عشاء کی نماز جماعت کے ساتھ پڑھے۔ (صحیح بخاری: 935)" },
    { category: "40 احادیث", arabic: "الْبِرُّ مَا طَمَعَتْ بِهِ النَّفْسُ", translation: "نیکی وہ ہے جو نفس کو خوش کرے۔ (صحیح مسلم: 2553)" },
    { category: "40 احادیث", arabic: "مَنْ أَحْسَنَ فَإِنَّ اللَّهَ يُحِبُّ الْمُحْسِنِينَ", translation: "جو نیکی کرے، اللہ نیکوکاروں سے محبت کرتا ہے۔ (سورہ البقرة: 195)" },
    { category: "40 احادیث", arabic: "الصَّبْرُ نِصْفُ الْإِيمَانِ", translation: "صبر ایمان کا آدھا حصہ ہے۔ (سنن ترمذی: 2516)" },
    { category: "40 احادیث", arabic: "مَنْ كَانَ يُؤْمِنُ بِاللَّهِ فَلْيَسْتَعِنْ بِاللَّهِ", translation: "جو اللہ پر ایمان رکھتا ہے، وہ اللہ سے مدد مانگے۔ (صحیح بخاری: 6383)" },
    { category: "40 احادیث", arabic: "الْحَيَاءُ مِنَ الْإِيمَانِ", translation: "حیا ایمان کا حصہ ہے۔ (صحیح بخاری: 24)" },
    { category: "40 احادیث", arabic: "مَنْ حُفِظَ لِسَانُهُ", translation: "جس نے اپنی زبان کو سنبھالا۔ (صحیح ترمذی: 2616)" },
    { category: "40 احادیث", arabic: "الْمُؤْمِنُ لَا يَأْكُلُ شَبْعًا", translation: "مومن پیٹ بھر کر کھانا نہیں کھاتا۔ (سنن ابن ماجہ: 3351)" },
    { category: "40 احادیث", arabic: "مَنْ صَلَّى الصَّلَوَاتِ الْخَمْسَ", translation: "جو پانچوں نمازیں پڑھے۔ (صحیح بخاری: 498)" },
    { category: "40 احادیث", arabic: "الْعِلْمُ يُزَكِّي الْقَلْبَ", translation: "علم دل کو پاک کرتا ہے۔ (سنن ترمذی: 2682)" },
    { category: "40 احادیث", arabic: "مَنْ تَزَوَّجَ فَقَدْ أَكْمَلَ نِصْفَ الدِّينِ", translation: "جو شادی کر لے، اس نے اپنے دین کا آدھا حصہ مکمل کر لیا۔ (سنن ترمذی: 1085)" },
    { category: "40 احادیث", arabic: "الْمَالُ لَا يَنْفَعُ إِلَّا بِالْعَمَلِ", translation: "مال صرف عمل سے فائدہ دیتا ہے۔ (صحیح بخاری: 1411)" },
    { category: "40 احادیث", arabic: "مَنْ حَسُنَ خُلْقُهُ", translation: "جس کا اخلاق اچھا ہو۔ (صحیح مسلم: 2328)" },
    { category: "40 احادیث", arabic: "الْجَنَّةُ تَحْتَ أَقْدَامِ الْأُمَّهَاتِ", translation: "جنت ماؤں کے قدموں تلے ہے۔ (سنن نسائی: 3104)" },
    { category: "40 احادیث", arabic: "مَنْ أَطْعَمَ مُؤْمِنًا", translation: "جو مومن کو کھانا کھلائے۔ (صحیح بخاری: 6452)" },
    { category: "40 احادیث", arabic: "الصَّلَاةُ مِفْتَاحُ الْجَنَّةِ", translation: "نماز جنت کا چابی ہے۔ (سنن ترمذی: 2612)" },
    { category: "40 احادیث", arabic: "مَنْ صَامَ رَمَضَانَ", translation: "جو رمضان کا روزہ رکھے۔ (صحیح بخاری: 1901)" },
    { category: "40 احادیث", arabic: "الْبَرُّ يَزِيدُ فِي الْعُمْرِ", translation: "نیکی عمر بڑھاتی ہے۔ (سنن ابن ماجہ: 3430)" }
];

const namesData = [
    {"name": "الرحمن", "transliteration": "Ar-Rahman", "ur_meaning": "بہت مہربان"},
    {"name": "الرحيم", "transliteration": "Ar-Rahim", "ur_meaning": "نہایت رحم والا"},
    {"name": "الملك", "transliteration": "Al-Malik", "ur_meaning": "بادشاہ"},
    {"name": "القدوس", "transliteration": "Al-Quddus", "ur_meaning": "پاک ذات"},
    {"name": "السلام", "transliteration": "As-Salam", "ur_meaning": "امن دینے والا"},
    {"name": "المؤمن", "transliteration": "Al-Mu’min", "ur_meaning": "امن عطا کرنے والا"},
    {"name": "المهيمن", "transliteration": "Al-Muhaymin", "ur_meaning": "نگہبان"},
    {"name": "العزيز", "transliteration": "Al-Azeez", "ur_meaning": "غالب"},
    {"name": "الجبار", "transliteration": "Al-Jabbar", "ur_meaning": "زبردست"},
    {"name": "المتكبر", "transliteration": "Al-Mutakabbir", "ur_meaning": "بزرگی والا"},
    {"name": "الخالق", "transliteration": "Al-Khaliq", "ur_meaning": "خالق"},
    {"name": "البارئ", "transliteration": "Al-Bari", "ur_meaning": "بنانے والا"},
    {"name": "المصور", "transliteration": "Al-Musawwir", "ur_meaning": "صورت دینے والا"},
    {"name": "الغفار", "transliteration": "Al-Ghaffar", "ur_meaning": "بہت معاف کرنے والا"},
    {"name": "القهار", "transliteration": "Al-Qahhar", "ur_meaning": "غالب و قہار"},
    {"name": "الوهاب", "transliteration": "Al-Wahhab", "ur_meaning": "بہت عطا کرنے والا"},
    {"name": "الرزاق", "transliteration": "Ar-Razzaq", "ur_meaning": "روزگار دینے والا"},
    {"name": "الفتاح", "transliteration": "Al-Fattah", "ur_meaning": "فیصلہ کرنے والا"},
    {"name": "العليم", "transliteration": "Al-Alim", "ur_meaning": "ہر چیز جاننے والا"},
    {"name": "القابض", "transliteration": "Al-Qabid", "ur_meaning": "روکنے والا"},
    {"name": "الباسط", "transliteration": "Al-Basit", "ur_meaning": "پھیلانے والا"},
    {"name": "الخافض", "transliteration": "Al-Khafid", "ur_meaning": "نیچا کرنے والا"},
    {"name": "الرافع", "transliteration": "Ar-Rafi", "ur_meaning": "بلند کرنے والا"},
    {"name": "المعز", "transliteration": "Al-Mu’izz", "ur_meaning": "عزت دینے والا"},
    {"name": "المذل", "transliteration": "Al-Mudhill", "ur_meaning": "ذلت دینے والا"},
    {"name": "السميع", "transliteration": "As-Sami", "ur_meaning": "ہر چیز سننے والا"},
    {"name": "البصير", "transliteration": "Al-Baseer", "ur_meaning": "ہر چیز دیکھنے والا"},
    {"name": "الحكيم", "transliteration": "Al-Hakim", "ur_meaning": "حکمت والا"},
    {"name": "العدل", "transliteration": "Al-Adl", "ur_meaning": "عدل کرنے والا"},
    {"name": "اللطيف", "transliteration": "Al-Latif", "ur_meaning": "نہایت نازک"},
    {"name": "الخبير", "transliteration": "Al-Khabir", "ur_meaning": "ہر چیز سے واقف"},
    {"name": "الحليم", "transliteration": "Al-Haleem", "ur_meaning": "نہایت بردبار"},
    {"name": "العظيم", "transliteration": "Al-Azeem", "ur_meaning": "بہت بڑا"},
    {"name": "الغفور", "transliteration": "Al-Ghafur", "ur_meaning": "بہت معاف کرنے والا"},
    {"name": "الشكور", "transliteration": "Ash-Shakur", "ur_meaning": "بہت شکر گزار"},
    {"name": "العلي", "transliteration": "Al-Ali", "ur_meaning": "بہت بلند"},
    {"name": "الكبير", "transliteration": "Al-Kabeer", "ur_meaning": "بہت بڑا"},
    {"name": "الحفيظ", "transliteration": "Al-Hafiz", "ur_meaning": "محافظ"},
    {"name": "المقيت", "transliteration": "Al-Muqit", "ur_meaning": "قوت دینے والا"},
    {"name": "الحسيب", "transliteration": "Al-Haseeb", "ur_meaning": "حساب لینے والا"},
    {"name": "الجليل", "transliteration": "Al-Jaleel", "ur_meaning": "بہت عظیم"},
    {"name": "الكريم", "transliteration": "Al-Kareem", "ur_meaning": "بہت کریم"},
    {"name": "الرقيب", "transliteration": "Ar-Raqeeb", "ur_meaning": "نگہبان"},
    {"name": "المجيب", "transliteration": "Al-Mujib", "ur_meaning": "دعا قبول کرنے والا"},
    {"name": "الواسع", "transliteration": "Al-Wasi", "ur_meaning": "بہت وسیع"},
    {"name": "الحكم", "transliteration": "Al-Hakam", "ur_meaning": "فیصلہ کرنے والا"},
    {"name": "الودود", "transliteration": "Al-Wadud", "ur_meaning": "بہت محبت کرنے والا"},
    {"name": "المجيد", "transliteration": "Al-Majid", "ur_meaning": "بہت عزت والا"},
    {"name": "الباعث", "transliteration": "Al-Ba’ith", "ur_meaning": "اٹھانے والا"},
    {"name": "الشهيد", "transliteration": "Ash-Shahid", "ur_meaning": "گواہ"},
    {"name": "الحق", "transliteration": "Al-Haqq", "ur_meaning": "حقیقی"},
    {"name": "الوكيل", "transliteration": "Al-Wakeel", "ur_meaning": "بھروسہ کرنے والا"},
    {"name": "القوي", "transliteration": "Al-Qawi", "ur_meaning": "بہت قوت والا"},
    {"name": "المتين", "transliteration": "Al-Matin", "ur_meaning": "بہت مضبوط"},
    {"name": "الولي", "transliteration": "Al-Wali", "ur_meaning": "دوست"},
    {"name": "الحميد", "transliteration": "Al-Hameed", "ur_meaning": "بہت حمد والا"},
    {"name": "المحصي", "transliteration": "Al-Muhsi", "ur_meaning": "ہر چیز گننے والا"},
    {"name": "المبدئ", "transliteration": "Al-Mubdi", "ur_meaning": "شروع کرنے والا"},
    {"name": "المعيد", "transliteration": "Al-Mu’id", "ur_meaning": "دوبارہ پیدا کرنے والا"},
    {"name": "المحيي", "transliteration": "Al-Muhyi", "ur_meaning": "زندہ کرنے والا"},
    {"name": "المميت", "transliteration": "Al-Mumit", "ur_meaning": "موت دینے والا"},
    {"name": "الحي", "transliteration": "Al-Hayy", "ur_meaning": "زندہ"},
    {"name": "القيوم", "transliteration": "Al-Qayyum", "ur_meaning": "خود موجود"},
    {"name": "الواجد", "transliteration": "Al-Wajid", "ur_meaning": "پانے والا"},
    {"name": "الماجد", "transliteration": "Al-Majid", "ur_meaning": "بہت عزت والا"},
    {"name": "الواحد", "transliteration": "Al-Wahid", "ur_meaning": "اکیلا"},
    {"name": "الاحد", "transliteration": "Al-Ahad", "ur_meaning": "ایک"},
    {"name": "الصمد", "transliteration": "As-Samad", "ur
