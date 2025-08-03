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
            duaPage: "مسنون دعائیں",
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
async function fetchSurahList() { /* ... (This function remains the same) ... */ }
function displaySurahs(surahs) { /* ... (This function remains the same) ... */ }
async function loadSurah(surahId) { /* ... (This function remains the same) ... */ }

// --- AI Chat Functionality ---
const chatMessages = document.getElementById('chat-messages');
const chatInput = document.getElementById('chat-input');
const sendChatButton = document.getElementById('send-chat-button');
chatInput.addEventListener('keypress', (event) => { if (event.key === 'Enter') sendMessage(); });
sendChatButton.addEventListener('click', sendMessage);
function sendMessage() { /* ... (This function remains the same) ... */ }
function addMessageToChat(message, sender, isTyping = false) { /* ... (This function remains the same) ... */ }
async function askGoogleAI(question) { /* ... (This function remains the same, with the detailed prompt) ... */ }

// --- Tasbih Functionality ---
const tasbihCounter = document.getElementById('tasbih-counter');
const tasbihBead = document.getElementById('tasbih-bead');
const resetButton = document.getElementById('reset-button');
let count = 0;
tasbihBead.addEventListener('click', () => { /* ... (This function remains the same) ... */ });
resetButton.addEventListener('click', () => { /* ... (This function remains the same) ... */ });

// --- Dua & 99 Names Functionality ---
const duaCategoriesContainer = document.getElementById('dua-categories');
const duaListContainer = document.getElementById('dua-list');
const namesContainer = document.getElementById('names-container');
const showNamesBtn = document.getElementById('show-names-btn');
showNamesBtn.addEventListener('click', () => openModal('names-modal'));
let allDuas = [];

async function fetchDuas() {
    // We will create our own dua list as there's no reliable free API for this
    allDuas = [
        // Add all 50+ duas here in this format
        { category: "صبح و شام", arabic: "أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ", translation: "میں اللہ کے کامل کلمات کی پناہ میں آتا ہوں، اس کی مخلوق کے شر سے۔" },
        // ... more duas
    ];
    const categories = [...new Set(allDuas.map(d => d.category))];
    displayDuaCategories(categories);
    filterDuas(categories[0]); // Show the first category by default
}
function displayDuaCategories(categories) { /* ... */ }
function filterDuas(category) { /* ... */ }
async function fetchNamesOfAllah() { /* ... (This function remains the same) ... */ }
function displayNames(names) { /* ... (This function remains the same) ... */ }

// --- Home Page Functionality ---
const prayerTimeContainer = document.getElementById('prayer-times-container');
const dailyAyahContainer = document.getElementById('daily-ayah-container');
const prayerTimeLoader = document.getElementById('prayer-time-loader');

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
function displayPrayerTimes(timings) { /* ... */ }
function showRandomAyah() { /* ... */ }

// --- Modal & Menu Links ---
function openModal(modalId) { /* ... (This function remains the same) ... */ }
function closeModal(modalId) { /* ... (This function remains the same) ... */ }
function closeAllModals() { /* ... (This function remains the same) ... */ }
document.getElementById('rate-app-link').addEventListener('click', (e) => { /* ... */ });
document.getElementById('share-app-link').addEventListener('click', (e) => { /* ... */ });

// --- Initial Load ---
document.addEventListener('DOMContentLoaded', () => {
    fetchSurahList();
    showPage('homeCustomPage'); // Start on the new Home page
    
    // Get user location for prayer times
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(position => {
            getPrayerTimes(position.coords.latitude, position.coords.longitude);
        }, () => {
            prayerTimeLoader.textContent = "لوکیشن کی اجازت درکار ہے۔";
        });
    } else {
        prayerTimeLoader.textContent = "آپ کا براؤزر لوکیشن کو سپورٹ نہیں کرتا۔";
    }
    showRandomAyah();
    setInterval(showRandomAyah, 600000); // Update every 10 minutes
});

// Service Worker Registration
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').then(reg => console.log('SW registered.')).catch(err => console.log('SW registration failed:', err));
    });
}
