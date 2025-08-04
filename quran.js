document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const surahList = document.getElementById('surah-list');
    const surahHeader = document.getElementById('surahHeader');
    const surahContainer = document.getElementById('surahContainer');
    const mainAudioPlayer = document.getElementById('mainAudioPlayer');
    const quranListPage = document.getElementById('quranListPage');
    const surahDetailPage = document.getElementById('surahDetailPage');
    const menuButton = document.getElementById('menu-button');
    const sideMenu = document.getElementById('side-menu');
    const menuOverlay = document.getElementById('menu-overlay');

    // --- Page Navigation within Quran Section ---
    window.showQuranPage = function(pageId) {
        if (pageId === 'quranListPage') {
            quranListPage.classList.add('active');
            surahDetailPage.classList.remove('active');
            mainAudioPlayer.pause();
            mainAudioPlayer.src = '';
        } else {
            quranListPage.classList.remove('active');
            surahDetailPage.classList.add('active');
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
            surahList.innerHTML = '<p style="color: white; text-align: center; font-size: 1.2rem;">سورہ کی فہرست لوڈ ہو رہی ہے...</p>';
            const response = await fetch('https://api.quran.com/api/v4/chapters');
            if (!response.ok) throw new Error('Network response was not ok');
            const data = await response.json();
            displaySurahs(data.chapters);
        } catch (error) {
            surahList.innerHTML = '<p style="color: white; text-align: center;">سورہ کی فہرست لوڈ کرنے میں ناکامی۔ براہ کرم اپنا انٹرنیٹ کنکشن چیک کریں۔</p>';
            console.error("Error fetching surah list:", error);
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
        showQuranPage('surahDetailPage');
        surahHeader.innerHTML = '<h1>لوڈ ہو رہا ہے...</h1>';
        surahContainer.innerHTML = '';
        
        try {
            const [versesRes, infoRes, audioRes] = await Promise.all([
                fetch(`https://api.quran.com/api/v4/quran/verses/uthmani?chapter_number=${surahId}`),
                fetch(`https://api.quran.com/api/v4/chapters/${surahId}`),
                fetch(`https://api.quran.com/api/v4/chapter_recitations/7/${surahId}`) // कारी: Mishary Rashid Alafasy
            ]);

            if (!versesRes.ok || !infoRes.ok || !audioRes.ok) throw new Error('Failed to fetch surah data');

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

    // --- Modal & Menu Links ---
    // (We'll centralize this in a common.js file later if needed)
    window.openModal = function(modalId) {
        closeAllModals();
        document.getElementById(modalId).style.display = 'flex';
    }
    window.closeAllModals = function() {
        document.querySelectorAll('.modal').forEach(modal => modal.style.display = 'none');
    }
    document.getElementById('rate-app-link').addEventListener('click', (e) => { e.preventDefault(); window.open('https://play.google.com/store/apps/details?id=com.faraz.quranapp', '_blank'); });
    document.getElementById('share-app-link').addEventListener('click', (e) => { e.preventDefault(); const shareData = { title: 'القرآن الكريم - Faraz AI', text: 'कुरान पढ़ें, सुनें और AI असिस्टेंट "फराज" से इस्लामी सवाल पूछें। इस खूबसूरत ऐप को डाउनलोड करें!', url: 'https://play.google.com/store/apps/details?id=com.faraz.quranapp' }; if (navigator.share) { navigator.share(shareData).catch(console.error); } else { alert(shareData.text + "\n" + shareData.url); } });

    // --- Initial Load for this page ---
    fetchSurahList();
});
