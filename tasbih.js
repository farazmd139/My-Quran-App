document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const menuButton = document.getElementById('menu-button');
    const sideMenu = document.getElementById('side-menu');
    const menuOverlay = document.getElementById('menu-overlay');
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
        { name: "أَسْتَغْفِرُ اللَّهَ", target: 100 },
        { name: "لَا إِلَهَ إِلَّا اللَّهُ", target: 100 },
        { name: "لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ", target: 100 },
        { name: "سُبْحَانَ اللَّهِ وَبِحَمْدِهِ", target: 100 },
        { name: "سُبْحَانَ اللَّهِ الْعَظِيمِ", target: 100 },
        { name: "اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ", target: 100 },
        { name: "حَسْبِيَ اللَّهُ لَا إِلَهَ إِلَّا هُوَ", target: 100 }
    ];

    // --- Side Menu Logic ---
    menuButton.addEventListener('click', () => {
        sideMenu.classList.toggle('open');
        menuOverlay.classList.toggle('open');
    });
    menuOverlay.addEventListener('click', () => {
        sideMenu.classList.remove('open');
        menuOverlay.classList.remove('open');
    });

    // --- Tasbih Functionality ---
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
        
        // Vibrate for haptic feedback
        if (navigator.vibrate) {
            navigator.vibrate(50); // Vibrate for 50ms
        }

        // Special vibration when target is reached
        if (count == tasbihSelect.value) {
            if (navigator.vibrate) {
                navigator.vibrate([100, 50, 100]); // Vibrate pattern
            }
        }
    });

    resetButton.addEventListener('click', () => {
        count = 0;
        tasbihCounter.innerText = count;
        if (navigator.vibrate) {
            navigator.vibrate(100);
        }
    });
    
    // --- Modal & Menu Links ---
    window.openModal = function(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) modal.style.display = 'flex';
    }
    window.closeAllModals = function() {
        document.querySelectorAll('.modal').forEach(modal => modal.style.display = 'none');
    }
    document.getElementById('rate-app-link').addEventListener('click', (e) => { e.preventDefault(); window.open('https://play.google.com/store/apps/details?id=com.faraz.quranapp', '_blank'); });
    document.getElementById('share-app-link').addEventListener('click', (e) => { e.preventDefault(); const shareData = { title: 'القرآن الكريم - Faraz AI', text: 'कुरान पढ़ें, सुनें और AI असिस्टेंट "फराज" से इस्लामी सवाल पूछें। इस खूबसूरत ऐप को डाउनलोड करें!', url: 'https://play.google.com/store/apps/details?id=com.faraz.quranapp' }; if (navigator.share) { navigator.share(shareData).catch(console.error); } else { alert(shareData.text + "\n" + shareData.url); } });

    // --- Initial Load for this page ---
    updateTarget();
});
