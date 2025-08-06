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
const prayerTimeLoader = document.getElementById('prayer-time-loader');
const rateAppLink = document.getElementById('rate-app-link');
const shareAppLink = document.getElementById('share-app-link');
const sahabaStoriesContainer = document.getElementById('sahaba-stories-container');


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
    
    if (pageId === 'homeCustomPage' || pageId === 'quranPage' || pageId === 'duaPage' || pageId === 'tasbihPage') {
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
    { arabic: "وَمَنْ يَتَوَكَّلْ عَلَى اللَّهِ فَهُوَ حَسْبُهُ", translation: "اور جو اللہ پر بھروسہ کرتا ہے، تو وہ اس کے لیے کافی ہے۔" }
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

// --- 10 Sahaba Ka Waqiya Data ---
const sahabaStories = [
    {
        title_arabic: "حضرت ابو بکر صدیقؓ",
        title_english: "Hazrat Abu Bakr (RA)",
        story: "حضرت ابو بکر صدیق رضی اللہ عنہ، جن کا اصل نام عبداللہ بن ابی قحافہ تھا، رسول اللہ صلی اللہ علیہ وسلم کے سب سے قریبی اور وفادار ساتھی تھے۔ آپؑ مردوں میں سب سے پہلے اسلام قبول کرنے والے تھے اور آپ کو 'صدیق' یعنی 'سچا' کا لقب ملا کیونکہ آپ نے معراج کے واقعہ کی بغیر کسی ہچکچاہٹ کے تصدیق کی تھی۔ آپ نے اپنی تمام دولت اور زندگی اسلام کے لیے وقف کر دی۔ جب کفار مکہ نے مسلمانوں پر ظلم کی انتہا کر دی، تو آپ نے بہت سے غلاموں کو خرید کر آزاد کروایا، جن میں حضرت بلال حبشی رضی اللہ عنہ بھی شامل تھے۔ ہجرت کے موقع پر آپ غار ثور میں رسول اللہ ﷺ کے ساتھ تھے، جس کا ذکر قرآن مجید میں بھی ہے۔ رسول اللہ ﷺ کے وصال کے بعد، آپ کو پہلا خلیفہ منتخب کیا گیا۔ آپ کا دور خلافت اگرچہ مختصر تھا، لیکن انتہائی اہم فیصلوں سے بھرا تھا۔ آپ نے جھوٹے نبیوں کے خلاف جنگیں لڑیں اور زکوٰۃ کے منکرین کا خاتمہ کرکے اسلامی ریاست کو مستحکم کیا۔ آپ نے ہی حضرت عمرؓ کے مشورے پر قرآن مجید کو ایک کتابی شکل میں جمع کرنے کا کام شروع کروایا، جو اسلام کی تاریخ کا ایک عظیم کارنامہ ہے۔ آپ کی زندگی سادگی، ایمانداری، اور اللہ اور اس کے رسول سے بے پناہ محبت کا بہترین نمونہ ہے۔ آپ کا وصال 63 سال کی عمر میں ہوا اور آپ کو رسول اللہ ﷺ کے پہلو میں دفن کیا گیا۔"
    },
    {
        title_arabic: "حضرت عمر فاروقؓ",
        title_english: "Hazrat Umar (RA)",
        story: "حضرت عمر بن خطاب رضی اللہ عنہ، اسلام کے دوسرے خلیفہ، اپنی جرأت، انصاف اور انتظامی صلاحیتوں کی وجہ سے تاریخ میں ایک منفرد مقام رکھتے ہیں۔ اسلام قبول کرنے سے پہلے آپ مسلمانوں کے سخت مخالف تھے، لیکن رسول اللہ ﷺ کی دعا کے نتیجے میں آپ نے اسلام قبول کیا، جس سے مسلمانوں کو بہت تقویت ملی۔ آپ کے اسلام لانے کا واقعہ مشہور ہے جب آپ اپنی بہن کے گھر قرآن سن کر متاثر ہوئے اور سیدھے رسول اللہ ﷺ کی خدمت میں حاضر ہو کر ایمان لے آئے۔ آپ کو 'فاروق' کا لقب ملا، یعنی حق اور باطل میں فرق کرنے والا۔ آپ کے دور خلافت کو اسلامی فتوحات کا سنہری دور کہا جاتا ہے۔ آپ کے زمانے میں اسلامی سلطنت ایران، عراق، شام، اور مصر تک پھیل گئی۔ آپ صرف ایک فاتح ہی نہیں تھے، بلکہ ایک بہترین منتظم بھی تھے۔ آپ نے اسلامی کیلنڈر (ہجری) کا آغاز کیا، عدالتوں کا نظام قائم کیا، پولیس کا محکمہ بنایا، اور بیت المال کا شعبہ منظم کیا۔ آپ کا انصاف ایسا تھا کہ کوئی بھی شخص، چاہے وہ امیر ہو یا غریب، آپ کے سامنے اپنی شکایت لے کر آ سکتا تھا۔ آپ راتوں کو بھیس بدل کر رعایا کی خبر گیری کرتے تھے۔ ایک بار آپ نے ایک غریب عورت اور اس کے بھوکے بچوں کو دیکھا تو خود بیت المال سے راشن اپنی پیٹھ پر لاد کر لائے۔ آپ کی زندگی تقویٰ اور سادگی کا اعلیٰ نمونہ تھی۔ آپ کے کرتے پر کئی پیوند لگے ہوتے تھے۔ آپ کی شہادت ایک ایرانی غلام فیروز نے فجر کی نماز کے دوران خنجر سے حملہ کر کے کی۔"
    },
    {
        title_arabic: "حضرت عثمان غنیؓ",
        title_english: "Hazrat Uthman (RA)",
        story: "حضرت عثمان بن عفان رضی اللہ عنہ، اسلام کے تیسرے خلیفہ، اپنی سخاوت، حیاء اور نرم مزاجی کی وجہ سے مشہور ہیں۔ آپ کا تعلق قریش کے معزز قبیلے بنو امیہ سے تھا۔ آپ دولت مند تاجر تھے اور اپنی دولت اسلام کی خدمت کے لیے بے دریغ خرچ کرتے تھے۔ اسی وجہ سے آپ کو 'غنی' یعنی سخی کا لقب ملا۔ آپ نے مسلمانوں کے لیے میٹھے پانی کا کنواں 'بئر رومہ' خریدا اور مسجد نبوی کی توسیع کے لیے زمین وقف کی۔ جنگ تبوک کے موقع پر آپ نے اسلامی فوج کے لیے ایک بہت بڑا لشکر اپنے مال سے تیار کیا، جس پر رسول اللہ ﷺ بہت خوش ہوئے اور آپ کو جنت کی بشارت دی۔ آپ کو 'ذوالنورین' یعنی 'دو نوروں والا' بھی کہا جاتا ہے کیونکہ رسول اللہ ﷺ کی دو صاحبزادیاں، حضرت رقیہؓ اور ان کے انتقال کے بعد حضرت ام کلثومؓ، یکے بعد دیگرے آپ کے نکاح میں آئیں۔ آپ انتہائی حیا دار تھے، یہاں تک کہ رسول اللہ ﷺ نے فرمایا کہ عثمان سے فرشتے بھی حیا کرتے ہیں۔ آپ کے دور خلافت کا سب سے بڑا کارنامہ قرآن مجید کو قریش کی ایک متفقہ قرأت پر جمع کرنا اور اس کی کاپیاں پوری اسلامی سلطنت میں بھیجنا تھا تاکہ امت مسلمہ میں قرآن کے حوالے سے کوئی اختلاف پیدا نہ ہو۔ اس عظیم خدمت کی وجہ سے آپ کو 'جامع القرآن' بھی کہا جاتا ہے۔ آپ کی خلافت کے آخری سالوں میں کچھ سازشی عناصر نے آپ کے خلاف بغاوت کی اور آپ کے گھر کا محاصرہ کر لیا۔ چالیس دن کے محاصرے کے بعد باغیوں نے آپ کو قرآن مجید کی تلاوت کے دوران شہید کر دیا۔"
    },
    {
        title_arabic: "حضرت علی المرتضیٰؓ",
        title_english: "Hazrat Ali (RA)",
        story: "حضرت علی بن ابی طالب رضی اللہ عنہ، اسلام کے چوتھے خلیفہ، رسول اللہ صلی اللہ علیہ وسلم کے چچا زاد بھائی اور داماد تھے۔ آپ نے بچوں میں سب سے پہلے اسلام قبول کیا۔ آپ کی پرورش براہ راست رسول اللہ ﷺ کی نگرانی میں ہوئی۔ آپ اپنی بہادری، علم اور حکمت کی وجہ سے مشہور ہیں۔ آپ کو 'اسد اللہ' یعنی 'اللہ کا شیر' کا لقب ملا۔ غزوہ بدر، احد، خندق اور خیبر سمیت تمام اہم جنگوں میں آپ نے بے مثال شجاعت کا مظاہра کیا۔ جنگ خیبر میں جب بڑے بڑے بہادر ناکام ہو گئے، تو رسول اللہ ﷺ نے فرمایا کہ کل میں علم اس شخص کو دوں گا جس کے ہاتھ پر اللہ فتح دے گا، اور پھر آپ نے علم حضرت علیؓ کو عطا فرمایا اور آپ نے خیبر کا ناقابل تسخیر قلعہ فتح کیا۔ آپ علم کا دروازہ کہلاتے تھے۔ رسول اللہ ﷺ نے فرمایا، 'میں علم کا شہر ہوں اور علی اس کا دروازہ ہیں'۔ آپ کے فیصلے اور خطبات حکمت و دانائی سے بھرپور ہیں اور 'نہج البلاغہ' میں جمع ہیں۔ آپ کی زندگی انتہائی سادگی اور تقویٰ سے عبارت تھی۔ خلیفہ ہونے کے باوجود آپ ایک عام آدمی کی طرح رہتے تھے۔ آپ نے اپنی خلافت کے دوران بہت سی داخلی مشکلات اور جنگوں کا سامنا کیا، جن میں جنگ جمل اور جنگ صفین شامل ہیں۔ آپ کی شہادت کوفہ کی مسجد میں نماز کے دوران ایک خارجی، عبدالرحمٰن بن ملجم کے زہر آلود خنجر کے وار سے ہوئی۔ آپ کی زندگی اور قربانیاں آج بھی مسلمانوں کے لیے مشعل راہ ہیں۔"
    },
    {
        title_arabic: "حضرت طلحہ بن عبیداللہؓ",
        title_english: "Hazrat Talha (RA)",
        story: "حضرت طلحہ بن عبید اللہ رضی اللہ عنہ، عشرہ مبشرہ میں سے ایک، اپنی سخاوت اور بہادری کے لیے مشہور تھے۔ آپ کا شمار اسلام کے اولین مسلمانوں میں ہوتا ہے۔ آپ ایک کامیاب تاجر تھے اور اپنی دولت اللہ کی راہ میں خرچ کرنے کی وجہ سے 'طلحہ الفیاض' یعنی سخی طلحہ کے نام سے جانے جاتے تھے۔ جنگ احد کا دن آپ کی بہادری اور رسول اللہ ﷺ سے محبت کا عظیم ترین مظہر ہے۔ جب جنگ کا پانسہ پلٹا اور کفار نے رسول اللہ ﷺ کو گھیر لیا، تو حضرت طلحہؓ نے آپ ﷺ کو اپنے جسم سے ڈھانپ لیا۔ آپ نے اپنے جسم پر تیروں اور تلواروں کے ستر سے زائد زخم کھائے لیکن رسول اللہ ﷺ تک کسی حملے کو پہنچنے نہ دیا۔ آپ کا ایک ہاتھ اس جنگ میں ہمیشہ کے لیے ناکارہ ہو گیا تھا۔ اس بے مثال قربانی پر رسول اللہ ﷺ نے فرمایا کہ 'طلحہ نے اپنے اوپر جنت واجب کر لی'۔ آپ ﷺ نے انہیں 'زندہ شہید' کا لقب بھی عطا فرمایا۔ وہ جہاں بھی ضرورت مندوں کو دیکھتے، ان کی مدد کے لیے پہنچ جاتے۔ ایک بار ان کے پاس بہت بڑی رقم آئی تو وہ پریشان ہو گئے کہ اتنی دولت گھر میں رکھ کر مجھے نیند کیسے آئے گی۔ چنانچہ انہوں نے راتوں رات ساری رقم غریبوں اور مسکینوں میں تقسیم کر دی۔ آپ کی زندگی اسلام کے لیے غیر متزلزل وفاداری اور قربانی کی ایک روشن مثال ہے۔ آپ جنگ جمل میں شہید ہوئے۔ آپ کا شمار ان آٹھ لوگوں میں ہوتا ہے جنہوں نے سب سے پہلے اسلام قبول کیا۔"
    },
    {
        title_arabic: "حضرت زبیر بن العوامؓ",
        title_english: "Hazrat Zubair (RA)",
        story: "حضرت زبیر بن العوام رضی اللہ عنہ، عشرہ مبشرہ میں سے ایک، رسول اللہ صلی اللہ علیہ وسلم کے پھوپھی زاد بھائی تھے۔ آپ کی والدہ حضرت صفیہ بنت عبدالمطلب تھیں۔ آپ نے کم عمری میں ہی اسلام قبول کر لیا تھا۔ آپ کو 'حواری رسول' یعنی رسول اللہ ﷺ کا خاص مددگار ہونے کا اعزاز حاصل ہے۔ آپ پہلے شخص تھے جنہوں نے اسلام کے دفاع میں تلوار اٹھائی۔ ایک بار یہ افواہ پھیلی کہ رسول اللہ ﷺ کو شہید کر دیا گیا ہے، تو آپ ننگی تلوار لے کر غصے میں مکہ کی گلیوں میں نکل آئے۔ رسول اللہ ﷺ نے جب آپ کو اس حال میں دیکھا تو آپ کی محبت اور جذبے سے بہت خوش ہوئے اور آپ کے لیے دعا فرمائی۔ جنگ بدر، احد، اور دیگر تمام غزوات میں آپ نے بہادری کے جوہر دکھائے۔ جنگ یرموک میں آپ نے رومیوں کی صفوں کو چیرتے ہوئے ایسی بہادری دکھائی کہ دشمن بھی حیران رہ گئے۔ آپ ایک دولت مند تاجر تھے لیکن انتہائی سخی تھے۔ آپ اپنی دولت کو اللہ کی راہ میں خرچ کرنے میں کوئی ہچکچاہٹ محسوس نہیں کرتے تھے۔ حضرت علیؓ کے دور خلافت میں پیدا ہونے والے اختلافات کے نتیجے میں جنگ جمل میں آپ شریک ہوئے، لیکن جب حضرت علیؓ نے آپ کو رسول اللہ ﷺ کی ایک حدیث یاد دلائی تو آپ فوراً میدان جنگ سے الگ ہو گئے۔ واپسی پر ایک شخص، عمرو بن جرموز نے دھوکے سے آپ کو نماز کی حالت میں شہید کر دیا۔ جب قاتل نے آپ کی تلوار حضرت علیؓ کو پیش کی تو انہوں نے فرمایا، 'اس تلوار نے کئی بار رسول اللہ ﷺ کے چہرے سے پریشانیوں کو دور کیا ہے'۔"
    },
    {
        title_arabic: "حضرت عبدالرحمٰن بن عوفؓ",
        title_english: "Abdur Rahman (RA)",
        story: "حضرت عبدالرحمٰن بن عوف رضی اللہ عنہ، عشرہ مبشرہ میں سے ایک، اسلام کے عظیم تاجر اور سخی صحابہ میں شمار ہوتے ہیں۔ آپ نے حضرت ابو بکر صدیقؓ کی دعوت پر اسلام قبول کیا۔ جب آپ نے مکہ سے مدینہ ہجرت کی تو آپ کے پاس کچھ نہیں تھا۔ رسول اللہ ﷺ نے آپ کا بھائی چارہ حضرت سعد بن ربیع انصاریؓ سے کرایا، جنہوں نے اپنی آدھی جائیداد آپ کو پیش کی، لیکن حضرت عبدالرحمٰنؓ نے شکریہ کے ساتھ انکار کیا اور فرمایا، 'مجھے صرف بازار کا راستہ دکھا دو'۔ آپ نے مدینہ کے بازار میں تجارت شروع کی اور اللہ نے آپ کے کاروبار میں اتنی برکت دی کہ آپ مدینہ کے امیر ترین لوگوں میں سے ایک بن گئے۔ آپ کی سخاوت کا یہ عالم تھا کہ آپ نے کئی بار اپنا تجارتی قافلہ، جو سینکڑوں اونٹوں پر مشتمل ہوتا تھا، اللہ کی راہ میں صدقہ کر دیا۔ ایک موقع پر آپ نے چالیس ہزار دینار صدقہ کیے۔ جنگ تبوک کے موقع پر آپ نے اپنی آدھی دولت پیش کر دی۔ ایک بار مدینہ میں آپ کا سات سو اونٹوں پر مشتمل غلے کا قافلہ پہنچا تو پورے شہر میں شور مچ گیا۔ حضرت عائشہ صدیقہؓ نے جب یہ سنا تو فرمایا کہ میں نے رسول اللہ ﷺ کو فرماتے سنا ہے کہ عبدالرحمٰن بن عوف جنت میں گھٹنوں کے بل چلتے ہوئے داخل ہوں گے (دولت کی کثرت کی وجہ سے)۔ جب یہ بات حضرت عبدالرحمٰنؓ تک پہنچی تو انہوں نے پورا قافلہ مع سامان اللہ کی راہ میں خیرات کر دیا۔ آپ ان چھ صحابہ میں بھی شامل تھے جنہیں حضرت عمرؓ نے اپنی شہادت سے پہلے خلیفہ کے انتخاب کے لیے نامزد کیا تھا۔"
    },
    {
        title_arabic: "حضرت سعد بن ابی وقاصؓ",
        title_english: "Sa'd ibn Abi Waqqas (RA)",
        story: "حضرت سعد بن ابی وقاص رضی اللہ عنہ، عشرہ مبشرہ میں سے ایک، رسول اللہ صلی اللہ علیہ وسلم کے ماموں کے قبیلے سے تھے اور اسلام کے عظیم سپہ سالار تھے۔ آپ وہ پہلے شخص تھے جنہوں نے اللہ کی راہ میں تیر چلایا۔ آپ کی ہر دعا قبول ہوتی تھی کیونکہ رسول اللہ ﷺ نے آپ کے لیے دعا فرمائی تھی، 'اے اللہ! سعد کی دعا کو قبول فرما'۔ جب آپ نے اسلام قبول کیا تو آپ کی والدہ نے بھوک ہڑتال کر دی اور کہا کہ جب تک تم اسلام نہیں چھوڑو گے، میں کچھ نہیں کھاؤں پیوں گی۔ آپ اپنی والدہ سے بہت محبت کرتے تھے، لیکن آپ نے کہا، 'اے ماں! اگر آپ کی سو جانیں بھی ہوں اور ایک ایک کر کے نکل جائیں، تب بھی میں اسلام نہیں چھوڑوں گا'۔ آپ کے اس عزم پر قرآن مجید کی آیت نازل ہوئی۔ حضرت عمرؓ کے دور خلافت میں آپ کو ایران کی مہم پر سپہ سالار مقرر کیا گیا۔ جنگ قادسیہ میں آپ کی قیادت میں مسلمانوں نے ایک بہت بڑی اور طاقتور ایرانی فوج کو شکست دی اور ایران کی فتح کا دروازہ کھولا۔ اس جنگ میں آپ بیمار تھے، لیکن آپ نے ایک ٹیلے پر بیٹھ کر پوری جنگ کی کمان کی۔ آپ بہت بہادر اور ماہر تیر انداز تھے۔ رسول اللہ ﷺ نے غزوہ احد میں آپ سے فرمایا، 'سعد! تیر چلاؤ، میرے ماں باپ تم پر قربان ہوں'۔ یہ اعزاز کسی اور صحابی کو حاصل نہیں ہوا۔ آپ اپنی زندگی کے آخری ایام میں سیاست سے الگ ہو گئے تھے اور آپ کا انتقال مدینہ کے قریب 'عقیق' نامی مقام پر ہوا۔ آپ آخری مہاجر صحابی تھے جنہوں نے وفات پائی۔"
    },
    {
        title_arabic: "حضرت سعید بن زیدؓ",
        title_english: "Sa'id ibn Zayd (RA)",
        story: "حضرت سعید بن زید رضی اللہ عنہ، عشرہ مبشرہ میں سے ایک، قریش کے قبیلے بنو عدی سے تعلق رکھتے تھے۔ آپ حضرت عمر فاروق رضی اللہ عنہ کے چچا زاد بھائی اور بہنوئی تھے۔ آپ اور آپ کی اہلیہ، فاطمہ بنت خطاب، نے ابتدائی دنوں میں ہی اسلام قبول کر لیا تھا۔ آپ کے والد، زید بن عمرو بن نفیل، زمانہ جاہلیت میں بھی بت پرستی سے بیزار تھے اور دین ابراہیمی کے پیروکار تھے۔ حضرت عمرؓ کے اسلام قبول کرنے کا واقعہ آپ ہی کے گھر پیش آیا۔ جب حضرت عمرؓ کو پتہ چلا کہ ان کی بہن اور بہنوئی مسلمان ہو گئے ہیں، تو وہ غصے میں ان کے گھر پہنچے۔ وہاں آپ نے انہیں مارا، لیکن جب انہوں نے اپنی بہن کا عزم دیکھا اور قرآن کی آیات سنیں تو ان کا دل نرم پڑ گیا اور وہ اسلام لے آئے۔ حضرت سعیدؓ ایک بہادر جنگجو تھے۔ آپ جنگ بدر کے علاوہ تمام غزوات میں رسول اللہ ﷺ کے ساتھ شریک رہے۔ جنگ بدر کے موقع پر آپ کو حضرت طلحہؓ کے ساتھ دشمن کے قافلے کی خبر لانے کے لیے بھیجا گیا تھا، اس لیے آپ جنگ میں شریک نہ ہو سکے، لیکن رسول اللہ ﷺ نے آپ کو مال غنیمت اور اجر میں برابر کا حصہ دار ٹھہرایا۔ آپ بھی مستجاب الدعوات تھے، یعنی آپ کی دعائیں قبول ہوتی تھیں۔ اس کا ایک مشہور واقعہ ہے کہ ایک عورت نے آپ پر زمین ہتھیانے کا جھوٹا الزام لگایا۔ آپ نے اس کے خلاف دعا کی، 'اے اللہ! اگر یہ جھوٹی ہے تو اسے اندھا کر دے اور اسے اسی زمین میں گرا کر ہلاک کر دے'۔ چنانچہ وہ عورت اندھی ہو گئی اور ایک دن اپنی زمین پر چلتے ہوئے ایک گڑھے میں گر کر مر گئی۔ آپ نے اپنی زندگی کے آخری ایام مدینہ میں گزارے اور وہیں وفات پائی۔"
    },
    {
        title_arabic: "حضرت ابو عبیدہ بن الجراحؓ",
        title_english: "Abu Ubaidah (RA)",
        story: "حضرت ابو عبیدہ عامر بن الجراح رضی اللہ عنہ، عشرہ مبشرہ میں سے ایک، اپنی امانت داری کی وجہ سے مشہور ہیں۔ رسول اللہ صلی اللہ علیہ وسلم نے آپ کو 'امین الامت' یعنی 'اس امت کا امانت دار' کا لقب عطا فرمایا۔ آپ نے اسلام کے ابتدائی دور میں ہی ایمان قبول کیا اور حبشہ کی طرف ہجرت بھی کی۔ جنگ بدر میں آپ کا سامنا اپنے والد سے ہوا جو کفار کی طرف سے لڑ رہے تھے۔ آپ نے دین کی خاطر اپنے والد سے جنگ کی اور وہ مارے گئے۔ اس موقع پر قرآن کی آیت نازل ہوئی جس میں ایسے لوگوں کی تعریف کی گئی جو اللہ اور اس کے رسول کی محبت میں اپنے قریبی رشتوں کی بھی پرواہ نہیں کرتے۔ آپ ایک بہترین سپہ سالار تھے۔ حضرت عمرؓ کے دور خلافت میں جب حضرت خالد بن ولیدؓ کو شام کی سپہ سالاری سے معزول کیا گیا، تو حضرت ابو عبیدہؓ کو ان کی جگہ اسلامی فوج کا کمانڈر مقرر کیا گیا۔ آپ کی قیادت میں مسلمانوں نے شام کے بہت سے اہم شہر فتح کیے۔ جنگ یرموک کے فیصلہ کن معرکے میں آپ نے کلیدی کردار ادا کیا۔ آپ کی سب سے بڑی خوبی آپ کی انکساری اور امانت داری تھی۔ جب شام میں طاعون کی وبا پھیلی، جسے 'طاعون عمواس' کہا جاتا ہے، تو آپ لشکر کے سپہ سالار تھے۔ حضرت عمرؓ نے آپ کو خط لکھا کہ آپ مدینہ آ جائیں تاکہ وبا سے محفوظ رہ سکیں، لیکن آپ نے یہ کہہ کر آنے سے انکار کر دیا کہ میں اپنے سپاہیوں کو اس حال میں چھوڑ کر نہیں آ سکتا۔ آپ اسی طاعون کی وبا میں مبتلا ہو کر شہید ہو گئے۔ آپ کی زندگی اطاعت، امانت اور امت کی خدمت کا ایک بے مثال نمونہ ہے۔"
    }
];


// --- Function to display Sahaba Stories ---
function displaySahabaStories() {
    if (!sahabaStoriesContainer) return;
    sahabaStoriesContainer.innerHTML = ''; // Clear previous content
    sahabaStories.forEach(sahabi => {
        const storyBox = document.createElement('div');
        storyBox.className = 'sahaba-story-box';
        storyBox.innerHTML = `
            <div class="sahaba-story-content">
                <h3 class="sahaba-title-arabic">${sahabi.title_arabic}</h3>
                <p class="sahaba-title-english">${sahabi.title_english}</p>
                <button class="read-story-btn">واقیہ پڑھیں</button>
            </div>
        `;
        // Add event listener to open modal with the story
        storyBox.addEventListener('click', () => {
            openStoryModal(sahabi.title_arabic, sahabi.story);
        });
        sahabaStoriesContainer.appendChild(storyBox);
    });
}

// --- Function to open a modal with the story ---
function openStoryModal(title, story) {
    const existingModal = document.getElementById('story-modal');
    if (existingModal) {
        existingModal.remove();
    }

    const modal = document.createElement('div');
    modal.id = 'story-modal';
    modal.className = 'modal';

    const modalContent = document.createElement('div');
    modalContent.className = 'modal-content';

    const closeButton = document.createElement('span');
    closeButton.className = 'close-button';
    closeButton.innerHTML = '&times;';
    closeButton.onclick = () => modal.style.display = 'none';

    const modalTitle = document.createElement('h2');
    modalTitle.textContent = title;

    const modalBody = document.createElement('p');
    modalBody.textContent = story;
    modalBody.style.textAlign = 'right'; 
    modalBody.style.lineHeight = '2.2';

    const modalScrollable = document.createElement('div');
    modalScrollable.style.overflowY = 'auto';
    modalScrollable.style.maxHeight = '60vh';
    modalScrollable.appendChild(modalBody);

    modalContent.appendChild(closeButton);
    modalContent.appendChild(modalTitle);
    modalContent.appendChild(modalScrollable);
    modal.appendChild(modalContent);

    document.body.appendChild(modal);
    modal.style.display = 'flex';
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
    { category: "6 کلمے", arabic: "سُبْحَانَ اللَّهِ وَالْحَمْدُ لِلَّهِ وَلَا إِلَهَ إِلَّا اللَّهُ وَاللَّهُ أَكْبَرُ", translation: "اللہ پاک ہے، تمام تعریفیں اللہ کے لیے ہیں، کوئی معبود نہیں سوائے اللہ کے اور اللہ سب سے بڑا ہے۔", reference: "صحیح مسلم" },
    { category: "6 کلمے", arabic: "لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ يُحْيِي وَيُمِيتُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ", translation: "کوئی معبود نہیں سوائے اللہ کے، وہ اکیلا ہے، اس کا کوئی شریک نہیں، اسی کے لیے بادشاہی ہے اور اسی کے لیے حمد ہے، وہ زندہ کرتا ہے اور مارتا ہے، اور وہ ہر چیز پر قادر ہے۔", reference: "صحیح مسلم" },
    { category: "6 کلمے", arabic: "أَسْتَغْفِرُ اللَّهَ رَبِّي مِنْ كُلِّ ذَنْبٍ وَأَتُوبُ إِلَيْهِ", translation: "میں اپنے رب اللہ سے ہر گناہ کی مغفرت مانگتا ہوں اور اس کی طرف توبہ کرتا ہوں۔", reference: "صحیح بخاری" },
    { category: "6 کلمے", arabic: "اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنْ أَنْ أُشْرِكَ بِكَ شَيْئًا وَأَنَا أَعْلَمُ، وَأَسْتَغْفِرُكَ لِمَا لَا أَعْلَمُ", translation: "اے اللہ! میں تیری پناہ مانگتا ہوں اس سے کہ میں جانتے ہوئے تیرے ساتھ کسی کو شریک کروں، اور اس کے لیے مغفرت مانگتا ہوں جو میں نہیں جانتا۔", reference: "ابو داؤد" },

    // 50 دعائیں
    { category: "50 دعائیں", arabic: "اَللّٰھُمَّ اِنِّیْ اَسْئَلُکَ الْعَفْوَ وَالْعَافِیَةَ فِی الدُّنْیَا وَالْآخِرَةِ", translation: "اے اللہ! میں تجھ سے دنیا اور آخرت میں معافی اور عافیت مانگتا ہوں۔", reference: "ابن ماجہ" },
    { category: "50 دعائیں", arabic: "رَبَّنَا آتِنَا فِی الدُّنْیَا حَسَنَةً وَّفِی الْآخِرَةِ حَسَنَةً وَّقِنَا عَذَابَ النَّارِ", translation: "اے ہمارے رب! ہمیں دنیا میں بھلائی عطا فرما اور آخرت میں بھلائی عطا فرما اور ہمیں آگ کے عذاب سے بچا۔", reference: "البقرہ: 201" },
    { category: "50 دعائیں", arabic: "أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ", translation: "میں اللہ کے کامل کلمات کے ساتھ اس شر سے پناہ مانگتا ہوں جو اس نے پیدا کیا۔", reference: "صحیح مسلم" },
    { category: "50 دعائیں", arabic: "اللَّهُمَّ إِنِّي أَسْأَلُكَ الْجَنَّةَ وَأَعُوذُ بِكَ مِنَ النَّارِ", translation: "اے اللہ! میں تجھ سے جنت مانگتا ہوں اور دوزخ سے پناہ مانگتا ہوں۔", reference: "ابو داؤد" },
    { category: "50 دعائیں", arabic: "اللَّهُمَّ اغْفِرْ لِي ذَنْبِي كُلَّهُ دِقَّهُ وَجِلَّهُ", translation: "اے اللہ! میرے تمام گناہ معاف فرما، چھوٹے اور بڑے۔", reference: "صحیح مسلم" },
    { category: "50 دعائیں", arabic: "اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنْ زَوَالِ نِعْمَتِكَ", translation: "اے اللہ! میں تیری نعمت کے زوال سے تیری پناہ مانگتا ہوں۔", reference: "بخاری" },
    { category: "50 دعائیں", arabic: "اللَّهُمَّ إِنِّي أَسْأَلُكَ عِلْمًا نَافِعًا وَرِزْقًا طَيِّبًا وَعَمَلًا مُتَقَبَّلًا", translation: "اے اللہ! میں تجھ سے نفع بخش علم، پاکیزہ رزق اور قبول ہونے والا عمل مانگتا ہوں۔", reference: "ابن ماجہ" },
    { category: "50 دعائیں", arabic: "رَبِّ اجْعَلْنِي مُقِيمَ الصَّلَاةِ وَمِنْ ذُرِّيَّتِي رَبَّنَا وَتَقَبَّلْ دُعَاءِ", translation: "اے میرے رب! مجھے اور میری اولاد کو نماز قائم کرنے والا بنا اور ہماری دعا قبول فرما۔", reference: "ابراہیم: 40" },
    { category: "50 دعائیں", arabic: "اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْهَمِّ وَالْحَزَنِ", translation: "اے اللہ! میں تیری پناہ مانگتا ہوں غم اور فکر سے۔", reference: "بخاری" },
    { category: "50 دعائیں", arabic: "اللَّهُمَّ بَارِكْ لَنَا فِي أَرْزَاقِنَا", translation: "اے اللہ! ہمارے رزق میں برکت عطا فرما۔", reference: "ترمذی" },
    { category: "50 دعائیں", arabic: "اللَّهُمَّ اجْعَلْ فِي قَلْبِي نُورًا", translation: "اے اللہ! میرے دل میں نور عطا فرما۔", reference: "صحیح مسلم" },
    { category: "50 دعائیں", arabic: "اللَّهُمَّ إِنِّي أَسْأَلُكَ هُدًى وَتُقًى وَعَفَافًا وَغِنًى", translation: "اے اللہ! میں تجھ سے ہدایت، تقویٰ، پاکدامنی اور غنا مانگتا ہوں۔", reference: "صحیح مسلم" },
    { category: "50 دعائیں", arabic: "رَبِّ اغْفِرْ لِي وَلِوَالِدَيَّ", translation: "اے میرے رب! مجھے اور میرے والدین کو معاف فرما۔", reference: "نوح: 28" },
    { category: "50 دعائیں", arabic: "اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنْ عِلْمٍ لَا يَنْفَعُ", translation: "اے اللہ! میں تیری پناہ مانگتا ہوں اس علم سے جو نفع نہ دے۔", reference: "ابن ماجہ" },
    { category: "50 دعائیں", arabic: "اللَّهُمَّ ارْزُقْنِي حُبَّكَ وَحُبَّ مَنْ يُحِبُّكَ", translation: "اے اللہ! مجھے تیری محبت اور اس کی محبت عطا فرما جو تجھے محبت کرتا ہے۔", reference: "ترمذی" },
    { category: "50 دعائیں", arabic: "اللَّهُمَّ إِنِّي أَسْأَلُكَ رِزْقًا وَاسِعًا", translation: "اے اللہ! میں تجھ سے وسیع رزق مانگتا ہوں۔", reference: "ابن ماجہ" },
    { category: "50 دعائیں", arabic: "اللَّهُمَّ يَسِّرْ لِي خَيْرًا حَيْثُ كَانَ", translation: "اے اللہ! میرے لیے خیر کو آسان کر دے جہاں بھی ہو۔", reference: "ترمذی" },
    { category: "50 دعائیں", arabic: "اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنْ فِتْنَةِ النَّارِ", translation: "اے اللہ! میں تیری پناہ مانگتا ہوں دوزخ کی فتنہ سے۔", reference: "ابو داؤد" },
    { category: "50 دعائیں", arabic: "اللَّهُمَّ اجْعَلْنِي شَكُورًا", translation: "اے اللہ! مجھے شکر گزار بنا۔", reference: "ترمذی" },
    { category: "50 دعائیں", arabic: "اللَّهُمَّ إِنِّي أَسْأَلُكَ الْعَفْوَ وَالْمَغْفِرَةَ", translation: "اے اللہ! میں تجھ سے معافی اور بخشش مانگتا ہوں۔", reference: "ابن ماجہ" },
    { category: "50 دعائیں", arabic: "رَبِّ هَبْ لِي حُكْمًا وَأَلْحِقْنِي بِالصَّالِحِينَ", translation: "اے میرے رب! مجھے حکمت عطا فرما اور مجھے نیک لوگوں میں شامل کر۔", reference: "الشعراء: 83" },
    { category: "50 دعائیں", arabic: "اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنْ جَارٍ سُوءٍ", translation: "اے اللہ! میں تیری پناہ مانگتا ہوں برے پڑوسی سے۔", reference: "ابن ماجہ" },
    { category: "50 دعائیں", arabic: "اللَّهُمَّ إِنِّي أَسْأَلُكَ خَيْرَ الْمَسْأَلَةِ", translation: "اے اللہ! میں تجھ سے بہترین دعا مانگتا ہوں۔", reference: "ترمذی" },
    { category: "50 دعائیں", arabic: "اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنْ شَرِّ النَّفْسِ", translation: "اے اللہ! میں تیری پناہ مانگتا ہوں نفس کے شر سے۔", reference: "ابن ماجہ" },
    { category: "50 دعائیں", arabic: "اللَّهُمَّ أَعِنِّي عَلَى ذِكْرِكَ وَشُكْرِكَ", translation: "اے اللہ! میری مدد فرما تیرے ذکر اور شکر میں۔", reference: "ابو داؤد" },
    { category: "50 دعائیں", arabic: "رَبِّ زِدْنِي عِلْمًا", translation: "اے میرے رب! مجھے علم میں اضافہ فرما۔", reference: "طہ: 114" },
    { category: "50 دعائیں", arabic: "اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْجُبْنِ", translation: "اے اللہ! میں تیری پناہ مانگتا ہوں بزدلی سے۔", reference: "بخاری" },
    { category: "50 دعائیں", arabic: "اللَّهُمَّ إِنِّي أَسْأَلُكَ الْفِرْدَوْسَ الأَعْلَى", translation: "اے اللہ! میں تجھ سے جنت الفردوس مانگتا ہوں۔", reference: "ترمذی" },
    { category: "50 دعائیں", arabic: "اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْفَقْرِ", translation: "اے اللہ! میں تیری پناہ مانگتا ہوں غربت سے۔", reference: "ابن ماجہ" },
    { category: "50 دعائیں", arabic: "اللَّهُمَّ اجْعَلْنِي مِنَ التَّوَّابِينَ", translation: "اے اللہ! مجھے توبہ کرنے والوں میں سے بنا۔", reference: "ترمذی" },
    { category: "50 دعائیں", arabic: "اللَّهُمَّ إِنِّي أَسْأَلُكَ صِحَّةً فِي إِيمَانٍ", translation: "اے اللہ! میں تجھ سے ایمان میں صحت مانگتا ہوں۔", reference: "ابن ماجہ" },
    { category: "50 دعائیں", arabic: "اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنْ عَذَابِ الْقَبْرِ", translation: "اے اللہ! میں تیری پناہ مانگتا ہوں قبر کے عذاب سے۔", reference: "بخاری" },
    { category: "50 دعائیں", arabic: "اللَّهُمَّ إِنِّي أَسْأَلُكَ الْهُدَى وَالتُّقَى", translation: "اے اللہ! میں تجھ سے ہدایت اور تقویٰ مانگتا ہوں۔", reference: "ابو داؤد" },
    { category: "50 دعائیں", arabic: "اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْكَسَلِ", translation: "اے اللہ! میں تیری پناہ مانگتا ہوں سستی سے۔", reference: "ترمذی" },
    { category: "50 دعائیں", arabic: "اللَّهُمَّ اجْعَلْنِي مِنَ الصَّابِرِينَ", translation: "اے اللہ! مجھے صبر کرنے والوں میں سے بنا۔", reference: "ابن ماجہ" },
    { category: "50 دعائیں", arabic: "اللَّهُمَّ إِنِّي أَسْأَلُكَ الْجَمَالَ فِي الْخُلْقِ", translation: "اے اللہ! میں تجھ سے اخلاق میں خوبصورتی مانگتا ہوں۔", reference: "ترمذی" },
    { category: "50 دعائیں", arabic: "رَبِّ أَعُوذُ بِكَ مِنْ هَمَازَاتِ الشَّيَاطِينِ", translation: "اے میرے رب! میں شیاطین کے وسوسوں سے تیری پناہ مانگتا ہوں۔", reference: "المؤمنون: 97" },
    { category: "50 دعائیں", arabic: "اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنْ ضَيْقِ الدُّنْيَا", translation: "اے اللہ! میں تیری پناہ مانگتا ہوں دنیا کی تنگی سے۔", reference: "ابن ماجہ" },
    { category: "50 دعائیں", arabic: "اللَّهُمَّ إِنِّي أَسْأَلُكَ الْعِزَّةَ بِالْحَقِّ", translation: "اے اللہ! میں تجھ سے حق کے ساتھ عزت مانگتا ہوں۔", reference: "ترمذی" },

    // 40 احادیث
    { category: "40 احادیث", arabic: "إِنَّمَا الأَعْمَالُ بِالنِّيَّاتِ", translation: "اعمال کا دارومدار نیتوں پر ہے۔", reference: "صحیح بخاری: 1" },
    { category: "40 احادیث", arabic: "مَنْ يُرِدِ اللَّهُ بِهِ خَيْرًا يُفَقِّهْهُ فِي الدِّينِ", translation: "جسے اللہ بھلائی چاہتا ہے، اسے دین میں سمجھ دیتا ہے۔", reference: "صحیح بخاری: 71" },
    { category: "40 احادیث", arabic: "الْمُسْلِمُ مَنْ سَلِمَ الْمُsْلِمُونَ مِنْ لِسَانِهِ وَيَدِهِ", translation: "مسلمان وہ ہے جس سے دوسرے مسلمان اس کی زبان اور ہاتھ سے محفوظ رہیں۔", reference: "صحیح بخاری: 10" },
    { category: "40 احادیث", arabic: "لَا إِيمَانَ لِمَنْ لَا أَمَانَةَ لَهُ، وَلَا دِينَ لِمَنْ لَا عَهْدَ لَهُ", translation: "جس میں امانت نہ ہو اس کا ایمان نہیں، اور جس میں عہد نہ ہو اس کا دین نہیں۔", reference: "مسند احمد" },
    { category: "40 احادیث", arabic: "الدُّعَاءُ هُوَ الْعِبَادَةُ", translation: "دعا ہی عبادت ہے۔", reference: "ترمذی: 3372" },
    { category: "40 احادیث", arabic: "مَنْ صَلَّى عَلَيَّ وَاحِدَةً صَلَّى اللَّهُ عَلَيْهِ عَشْرًا", translation: "جو شخص مجھ پر ایک بار درود بھیجے، اللہ اس پر دس بار رحمتیں بھیجتا ہے۔", reference: "صحیح مسلم: 384" },
    { category: "40 احادیث", arabic: "الْمُسْلِمُ أَخُو الْمُسْلِمِ", translation: "مسلمان مسلمان کا بھائی ہے۔", reference: "صحیح بخاری: 2442" },
    { category: "40 احادیث", arabic: "اطْلُبُوا الْعِلْمَ مِنَ الْمَهْدِ إِلَى اللَّحْدِ", translation: "علم حاصل کرو گود سے قبر تک۔", reference: "ضعیف الجامع" },
    { category: "40 احادیث", arabic: "الصَّدَقَةُ تَطْفِئُ الْخَطِيئَةَ كَمَا يُطْفِئُ الْمَاءُ النَّارَ", translation: "صدقہ گناہ کو اس طرح بجھاتا ہے جیسے پانی آگ کو بجھاتا ہے۔", reference: "ترمذی: 2541" },
    { category: "40 احادیث", arabic: "مَنْ كَذَبَ عَلَيَّ مُتَعَمِّدًا فَلْيَتَبَوَّأْ مَقْعَدَهُ مِنَ النَّارِ", translation: "جو شخص جان بوجھ کر میری طرف جھوٹی بات منسوب کرے، وہ اپنا ٹھکانا جہنم میں بنا لے۔", reference: "صحیح بخاری: 108" },
    { category: "40 احادیث", arabic: "الْحَلَالُ بَيِّنٌ وَالْحَرَامُ بَيِّنٌ", translation: "حلال واضح ہے اور حرام بھی واضح ہے۔", reference: "صحیح مسلم: 1599" },
    { category: "40 احادیث", arabic: "خَيْرُكُمْ مَنْ تَعَلَّمَ الْقُرْآنَ وَعَلَّمَهُ", translation: "تم میں سے بہترین وہ ہے جو قرآن سیکھے اور سکھائے۔", reference: "صحیح بخاری: 5027" },
    { category: "40 احادیث", arabic: "الْمُؤْمِنُ الْقَوِيُّ خَيْرٌ وَأَحَبُّ إِلَى اللَّهِ مِنَ الْمُؤْمِنِ الضَّعِيفِ", translation: "طاقتور مومن کمزور مومن سے بہتر اور اللہ کے نزدیک زیادہ محبوب ہے۔", reference: "صحیح مسلم: 2664" },
    { category: "40 احادیث", arabic: "مَا نَقَصَتْ صَدَقَةٌ مِنْ مَالٍ", translation: "صدقہ مال میں کمی نہیں کرتا۔", reference: "صحیح مسلم: 2588" },
    { category: "40 احادیث", arabic: "كُلُّ مَعْرُوفٍ صَدَقَةٌ", translation: "ہر نیکی صدقہ ہے۔", reference: "صحیح بخاری: 6021" },
    { category: "40 احادیث", arabic: "الْعِبَادَةُ فِي الْهَرْجِ كَهِجْرَةٍ إِلَيَّ", translation: "فتنے کے زمانے میں عبادت کرنا میری طرف ہجرت کرنے کے برابر ہے۔", reference: "صحیح مسلم: 2948" },
    { category: "40 احادیث", arabic: "الْجَنَّةُ تَحْتَ أَقْدَامِ الأُمَّهَاتِ", translation: "جنت ماؤں کے قدموں تلے ہے۔", reference: "مسند احمد" },
    { category: "40 احادیث", arabic: "رِضَا الرَّبِّ فِي رِضَا الْوَالِدِ", translation: "رب کی رضا والد کی رضا میں ہے۔", reference: "ترمذی: 1899" },
    { category: "40 احادیث", arabic: "مَنْ حَسُنَ خُلُقُهُ بَلَغَ بِهِ دَرَجَةَ الصَّائِمِ الْقَائِمِ", translation: "جس کا اخلاق اچھا ہو وہ اپنے اخلاق سے روزہ دار اور قیام کرنے والے کے درجے کو پہنچ جاتا ہے۔", reference: "ابو داؤد: 4798" },
    { category: "40 احادیث", arabic: "مَنْ سَأَلَ اللَّهَ الشَّهَادَةَ بِصِدْقٍ بَلَّغَهُ اللَّهُ مَنَازِلَ الشُّهَدَاءِ", translation: "جو شخص سچے دل سے اللہ سے شہادت مانگے، اللہ اسے شہداء کے مرتبے تک پہنچا دیتا ہے۔", reference: "صحیح مسلم: 1909" },
    { category: "40 احادیث", arabic: "مَنْ صَلَّى الْعِشَاءَ فِي جَمَاعَةٍ فَكَأَنَّمَا قَامَ نِصْفَ اللَّيْلِ", translation: "جو شخص عشاء کی نماز جماعت سے پڑھے گویا اس نے آدھی رات قیام کیا۔", reference: "صحیح مسلم: 656" },
    { category: "40 احادیث", arabic: "الدُّعَاءُ سِلَاحُ الْمُؤْمِنِ", translation: "دعا مومن کا ہتھیار ہے۔", reference: "المستدرک الحاکم" },
    { category: "40 احادیث", arabic: "مَنْ سَلَكَ طَرِيقًا يَلْتَمِسُ فِيهِ عِلْمًا سَهَّلَ اللَّهُ لَهُ طَرِيقًا إِلَى الْجَنَّةِ", translation: "جو شخص علم کی تلاش میں کوئی راستہ اختیار کرتا ہے اللہ اس کے لیے جنت کا راستہ آسان کر دیتا ہے۔", reference: "صحیح مسلم: 2699" },
    { category: "40 احادیث", arabic: "إِنَّ اللَّهَ لَا يَنْظُرُ إِلَى صُوَرِكُمْ وَأَمْوَالِكُمْ وَلَكِنْ يَنْظُرُ إِلَى قُلُوبِكُمْ وَأَعْمَالِكُمْ", translation: "بے شک اللہ تمہاری صورتوں اور مالوں کو نہیں دیکھتا بلکہ تمہارے دلوں اور اعمال کو دیکھتا ہے۔", reference: "صحیح مسلم: 2564" },
    { category: "40 احادیث", arabic: "الْمُؤْمِنُ مِرْآةُ الْمُؤْمِنِ", translation: "مومن مومن کا آئینہ ہے۔", reference: "ابو داؤد: 4918" },
    { category: "40 احادیث", arabic: "مَنْ سَتَرَ مُسْلِمًا سَتَرَهُ اللَّهُ فِي الدُّنْيَا وَالآخِرَةِ", translation: "جو کسی مسلمان کی پردہ پوشی کرتا ہے، اللہ دنیا اور آخرت میں اس کی پردہ پوشی کرتا ہے۔", reference: "صحیح مسلم: 2699" },
    { category: "40 احادیث", arabic: "إِنَّ الصِّدْقَ يَهْدِي إِلَى الْبِرِّ وَإِنَّ الْبِرَّ يَهْدِي إِلَى الْجَنَّةِ", translation: "سچائی نیکی کی طرف رہنمائی کرتی ہے اور نیکی جنت کی طرف رہنمائی کرتی ہے۔", reference: "صحیح بخاری: 6094" },
    { category: "40 احادیث", arabic: "مَنْ قَرَأَ سُورَةَ الْكَهْفِ يَوْمَ الْجُمُعَةِ أَضَاءَ لَهُ مِنَ النُّورِ مَا بَيْنَ الْجُمُعَتَيْنِ", translation: "جو شخص جمعہ کے دن سورۃ الکہف پڑھے، اس کے لیے دو جمعوں کے درمیان نور روشن ہو جاتا ہے۔", reference: "المستدرک الحاکم" },
    { category: "40 احادیث", arabic: "أَحَبُّ الأَعْمَالِ إِلَى اللَّهِ أَدْوَمُهَا وَإِنْ قَلَّ", translation: "اللہ کے نزدیک سب سے پسندیدہ عمل وہ ہے جو ہمیشہ کیا جائے اگرچہ تھوڑا ہو۔", reference: "صحیح بخاری: 6464" },
    { category: "40 احادیث", arabic: "مَنْ أَصْبَحَ مِنْكُمْ آمِنًا فِي سِرْبِهِ مُعَافًى فِي جَسَدِهِ عِنْدَهُ قُوتُ يَوْمِهِ فَكَأَنَّمَا حِيزَتْ لَهُ الدُّنْيَا", translation: "جو تم میں سے اس حال میں صبح کرے کہ وہ اپنے گھر میں امن سے ہو، جسمانی طور پر تندرست ہو اور اس کے پاس اس دن کی خوراک ہو تو گویا اس کے لیے پوری دنیا جمع کر دی گئی۔", reference: "ترمذی: 2346" },
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
            filterContent(category);
        });
        duaCategoriesContainer.appendChild(button);
    });

    if (duaCategoriesContainer.firstChild) {
        duaCategoriesContainer.firstChild.classList.add('active');
        filterContent(categories[0]);
    }
}

function filterContent(category) {
    const items = allContent.filter(item => item.category === category);
    duaListContainer.innerHTML = '';
    items.forEach(item => {
        const card = document.createElement('div');
        card.className = 'dua-card';
        card.innerHTML = `<p class="dua-arabic">${item.arabic}</p><p class="dua-translation">${item.translation}${item.reference ? ` (${item.reference})` : ''}</p>`;
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

// --- Modal & Menu Links ---
function openModal(modalId) {
    closeAllModals();
    document.getElementById(modalId).style.display = 'flex';
    if (modalId === 'names-modal' && namesContainer.innerHTML === '') {
        displayNames(namesData);
    }
}
function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}
function closeAllModals() {
    document.querySelectorAll('.modal').forEach(modal => modal.style.display = 'none');
}

rateAppLink.addEventListener('click', (e) => { e.preventDefault(); window.open('https://play.google.com/store/apps/details?id=com.faraz.quranapp', '_blank'); });
shareAppLink.addEventListener('click', (e) => { e.preventDefault(); const shareData = { title: 'القرآن الكريم - Faraz AI', text: 'قرآن پڑھیں، سنیں اور AI اسسٹنٹ "فراز" سے اسلامی سوالات پوچھیں۔ یہ خوبصورت ایپ ڈاؤن لوڈ کریں!', url: 'https://play.google.com/store/apps/details?id=com.faraz.quranapp' }; if (navigator.share) { navigator.share(shareData).catch(console.error); } else { alert(shareData.text + "\n" + shareData.url); } });

// --- Initial Load ---
document.addEventListener('DOMContentLoaded', () => {
    showPage('homeCustomPage');
    fetchSurahList();
    updateTarget();
    loadDuaContent();
    displaySahabaStories(); 
    
    // Prayer times functionality is kept, but the display element is removed from HTML.
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(position => {
            // You can decide if you still want to fetch this data in the background
            // getPrayerTimes(position.coords.latitude, position.coords.longitude);
        }, () => { 
            if(prayerTimeLoader) prayerTimeLoader.textContent = "لوکیشن کی اجازت درکار ہے۔";
         });
    } else {
        if(prayerTimeLoader) prayerTimeLoader.textContent = "آپ کا براؤزر لوکیشن کو سپورٹ نہیں کرتا۔";
    }

    // Daily ayah functionality is kept, but the display element is removed from HTML.
    // showRandomAyah();
    // setInterval(showRandomAyah, 600000); 
});

// Service Worker Registration
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').then(reg => console.log('SW registered.')).catch(err => console.log('SW registration failed:', err));
    });
}
