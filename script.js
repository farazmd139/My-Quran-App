// --- DOM Elements ---
const quranListPage = document.getElementById('quranListPage');
const surahDetailPage = document.getElementById('surahDetailPage');
const surahList = document.getElementById('surah-list');
const surahHeader = document.getElementById('surahHeader');
const surahContainer = document.getElementById('surahContainer');
const mainAudioPlayer = document.getElementById('mainAudioPlayer');
const navButtons = document.querySelectorAll('.nav-button');

// --- Page Navigation ---
function showQuranPage(pageId) {
    // This function will now only handle pages within quran.html
    if (pageId === 'quranListPage') {
        quranListPage.classList.add('active');
        surahDetailPage.classList.remove('active');
        mainAudioPlayer.pause();
        mainAudioPlayer.src = '';
    } else if (pageId === 'surahDetailPage') {
        quranListPage.classList.remove('active');
        surahDetailPage.classList.add('active');
    }
}

// --- Quran Functionality ---
async function fetchSurahList() {
    try {
        const response = await fetch('https://api.quran.com/api/v4/chapters');
        if (!response.ok) {
            throw new Error(`API call failed with status: ${response.status}`);
        }
        const data = await response.json();
        displaySurahs(data.chapters);
    } catch (error) {
        surahList.innerHTML = '<p style="color: white; text-align: center;">سورہ کی فہرست لوڈ کرنے میں ناکامی। براہ کرم اپنا انٹرنیٹ کنکشن چیک کریں۔</p>';
        console.error("Error fetching surah list:", error);
    }
}

function displaySurahs(surahs) {
    surahList.innerHTML = ''; // Clear previous list
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
    showQuranPage('surahDetailPage');
    surahHeader.innerHTML = '<h1>لوڈ ہو رہا ہے...</h1>';
    surahContainer.innerHTML = '';
    
    try {
        const [versesRes, infoRes, audioRes] = await Promise.all([
            fetch(`https://api.quran.com/api/v4/quran/verses/uthmani?chapter_number=${surahId}`),
            fetch(`https://api.quran.com/api/v4/chapters/${surahId}`),
            fetch(`https://api.quran.com/api/v4/chapter_recitations/7/${surahId}`) // Reciter: Mishary Rashid Alafasy
        ]);

        const versesData = await versesRes.json();
        const infoData = await infoRes.json();
        const audioData = await audioRes.json();

        const surahInfo = infoData.chapter;
        surahHeader.innerHTML = `${surahInfo.bismillah_pre ? '<h1>بِسْمِ اللّٰهِ الرَّحْمٰنِ الرَّحِيْمِ</h1>' : ''}<h1>${surahInfo.name_arabic}</h1>`;
        
        mainAudioPlayer.src = audioData.audio_file.audio_url;
        mainAudioPlayer.play().catch(e => console.log("Autoplay was prevented by the browser."));

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


// --- Initial Load for the current page ---
document.addEventListener('DOMContentLoaded', () => {
    // This script will only run on quran.html, so we fetch the surah list directly.
    fetchSurahList();
    
    // Set the correct active button in the nav bar
    navButtons.forEach(btn => {
        if (btn.href && btn.href.includes('quran.html')) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
});
