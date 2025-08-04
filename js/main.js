document.addEventListener('DOMContentLoaded', () => {
    // --- This script should be included in every HTML file ---

    // --- DOM Elements (Common across all pages) ---
    const menuButton = document.getElementById('menu-button');
    const sideMenu = document.getElementById('side-menu');
    const menuOverlay = document.getElementById('menu-overlay');
    const rateAppLink = document.getElementById('rate-app-link');
    const shareAppLink = document.getElementById('share-app-link');
    const creditsModal = document.getElementById('credits-modal');
    
    // --- Side Menu Logic ---
    if (menuButton && sideMenu && menuOverlay) {
        menuButton.addEventListener('click', () => {
            sideMenu.classList.toggle('open');
            menuOverlay.classList.toggle('open');
        });
        menuOverlay.addEventListener('click', () => {
            sideMenu.classList.remove('open');
            menuOverlay.classList.remove('open');
        });
    }

    // --- Modal Control Logic ---
    window.openModal = function(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) modal.style.display = 'flex';
    }
    window.closeAllModals = function() {
        document.querySelectorAll('.modal').forEach(modal => modal.style.display = 'none');
    }

    // --- Share App Logic ---
    if (shareAppLink) {
        shareAppLink.addEventListener('click', (e) => {
            e.preventDefault();
            const shareData = {
                title: 'القرآن الكريم - Faraz AI',
                text: 'कुरान पढ़ें, सुनें और AI असिस्टेंट "फराज" से इस्लामी सवाल पूछें। इस खूबसूरत ऐप को डाउनलोड करें!',
                url: 'https://play.google.com/store/apps/details?id=com.faraz.quranapp' // Replace with your actual Play Store link
            };
            if (navigator.share) {
                navigator.share(shareData).catch(err => console.error("Share failed:", err));
            } else {
                // Fallback for browsers that don't support Web Share API
                alert(shareData.text + "\n" + shareData.url);
            }
        });
    }

    // --- Rate App Logic ---
    if (rateAppLink) {
        rateAppLink.addEventListener('click', (e) => {
            e.preventDefault();
            // Once your app is published, replace this with the actual link
            window.open('https://play.google.com/store/apps/details?id=com.faraz.quranapp', '_blank');
        });
    }

    // --- Service Worker Registration ---
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('/sw.js')
                .then(registration => {
                    console.log('ServiceWorker registration successful with scope: ', registration.scope);
                })
                .catch(err => {
                    console.log('ServiceWorker registration failed: ', err);
                });
        });
    }
});
