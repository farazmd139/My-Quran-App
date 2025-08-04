:root {
    --glow-color1: #0ebeff; --glow-color2: #ffdd40;
    --highlight-glow: #f39c12;
    --chat-header-bg: #161b22; --nav-bg: #161b22;
    --text-primary: #ecf0f1; --text-secondary: #aaa;
    --bg-color: #0d121a;
    --card-bg: rgba(22, 27, 34, 0.8);
}
html { scroll-behavior: smooth; }
body {
    font-family: 'Amiri', serif; background-color: var(--bg-color);
    margin: 0; padding: 0; direction: rtl; overflow-x: hidden; color: var(--text-primary);
    user-select: none; -webkit-user-select: none; -moz-user-select: none; -ms-user-select: none;
}
.main-content { padding: 80px 15px 85px 15px; }
.page { display: none; animation: pageFadeIn 0.5s ease; }
.page.active { display: block; }
@keyframes pageFadeIn { from { opacity: 0; } to { opacity: 1; } }

/* --- Top Header & Side Menu --- */
.top-header {
    position: fixed; top: 0; left: 0; right: 0; z-index: 1001;
    display: flex; justify-content: space-between; align-items: center;
    padding: 15px 20px; background-color: var(--chat-header-bg);
    box-shadow: 0 5px 15px rgba(0,0,0,0.3);
}
.header-title { font-family: 'Noto Nastaliq Urdu'; font-size: 1.5rem; color: white; }
.menu-button { background: none; border: none; color: white; cursor: pointer; padding: 5px; }
.menu-button .material-symbols-outlined { font-size: 28px; }
.side-menu {
    position: fixed; top: 0; right: -280px; width: 250px; height: 100%;
    background-color: #1e2732; z-index: 2002; padding-top: 80px;
    box-shadow: -5px 0 20px rgba(0,0,0,0.5); transition: right 0.3s ease-in-out;
}
.side-menu.open { right: 0; }
.side-menu a {
    display: block; padding: 15px 20px; color: var(--text-primary);
    text-decoration: none; font-size: 1.1rem; font-family: 'Noto Nastaliq Urdu';
    border-bottom: 1px solid rgba(255,255,255,0.1); transition: background-color 0.2s;
}
.side-menu a:hover { background-color: rgba(255,255,255,0.1); }
.menu-overlay {
    display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%;
    background-color: rgba(0,0,0,0.5); z-index: 2001;
}
.menu-overlay.open { display: block; }

/* --- Bottom Navigation Bar (Left-to-Right Order) --- */
.bottom-nav {
    position: fixed; bottom: 0; left: 0; right: 0; height: 65px;
    background-color: var(--nav-bg); border-top: 1px solid rgba(255, 255, 255, 0.1);
    display: flex; justify-content: space-around; align-items: center;
    z-index: 1000; box-shadow: 0 -5px 15px rgba(0,0,0,0.3);
    direction: ltr;
}
.nav-button { background: none; border: none; color: var(--text-secondary); display: flex; flex-direction: column; align-items: center; justify-content: center; cursor: pointer; transition: color 0.3s; flex-grow: 1; height: 100%; position: relative; }
.nav-button.active { color: var(--highlight-glow); }
.nav-button .material-symbols-outlined { font-size: 28px; }
.nav-label { font-size: 0.7rem; margin-top: 2px; font-family: Arial, sans-serif; }

/* --- AI Chat Icon & Page --- */
.ai-icon-container { width: 28px; height: 28px; border-radius: 5px; overflow: hidden; position: relative; background: #000; }
.ai-icon-container::before {
    content: ''; position: absolute; top: 0; left: 0; width: 300%; height: 100%;
    background: linear-gradient(90deg, #ff00ff, #00ffff, #ffff00, #ff00ff);
    animation: liquid-flow 4s linear infinite;
}
@keyframes liquid-flow { from { transform: translateX(0%); } to { transform: translateX(-66.66%); } }
#aiPage { height: calc(100vh - 145px); padding-top: 0; }
.chat-container { width: 100%; height: 100%; background-color: transparent; border-radius: 0; box-shadow: none; display: flex; flex-direction: column; overflow: hidden; border: none; }
.chat-messages { flex-grow: 1; padding: 15px; overflow-y: auto; direction: rtl; display: flex; flex-direction: column; gap: 15px; }
.message { padding: 12px 18px; border-radius: 20px; max-width: 85%; line-height: 1.7; font-family: 'Noto Nastaliq Urdu', sans-serif; font-size: 1.1rem; color: #e0e0e0; text-shadow: 1px 1px 3px rgba(0,0,0,0.5); }
.user-message { background-color: #2a3b47; align-self: flex-start; margin-right: auto; border-bottom-left-radius: 5px; }
.ai-message { background-color: #323d49; align-self: flex-end; margin-left: auto; border-bottom-right-radius: 5px; }
.chat-input-area { display: flex; padding: 15px; border-top: 1px solid rgba(255,255,255,0.1); background-color: var(--chat-header-bg); }
#chat-input { flex-grow: 1; padding: 12px 20px; border-radius: 25px; border: 1px solid #444; font-size: 1rem; background-color: #323d49; color: white; font-family: 'Noto Nastaliq Urdu', sans-serif; direction: ltr; }
#send-chat-button { width: 50px; height: 50px; margin-left: 10px; border-radius: 50%; border: none; background-color: var(--glow-color1); color: white; cursor: pointer; display: flex; align-items: center; justify-content: center; }

/* --- Quran & Surah Pages --- */
#quranPage { padding: 0; }
#surah-list { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 15px; list-style: none; padding: 20px 0; }
.surah-list-item { background-color: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 10px; padding: 15px; cursor: pointer; transition: background-color 0.3s, transform 0.3s; display: flex; align-items: center; justify-content: space-between; }
.surah-list-item:hover { background-color: rgba(255,255,255,0.1); transform: translateY(-5px); }
.surah-info { display: flex; align-items: center; text-align: left; direction: ltr; }
.surah-number { background-color: rgba(0,0,0,0.2); width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; border-radius: 5px; margin-right: 15px; font-size: 1rem; font-weight: bold; flex-shrink: 0; }
.surah-name-details h3 { margin: 0; font-size: 1.5rem; font-family: 'Noto Nastaliq Urdu'; color: white; }
.surah-name-details p { margin: 0; opacity: 0.7; font-size: 0.9rem; }
.surah-arabic-name { font-size: 1.8rem; font-family: 'Amiri', serif; color: var(--glow-color2); }
#surahDetailPage .header h1 { font-size: 3.5rem; }
.surah-container { display: grid; grid-template-columns: 1fr; gap: 20px; }
@keyframes box-color-change { 0%, 100% { background: linear-gradient(145deg, #2c3e50, #34495e); } 33% { background: linear-gradient(145deg, #16a085, #1abc9c); } 66% { background: linear-gradient(145deg, #8e44ad, #9b59b6); } }
.ayah-box { padding: 25px 20px; border-radius: 15px; color: #fff; box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3); border: 1px solid rgba(255,255,255,0.1); display: flex; flex-direction: column; animation: box-color-change 18s linear infinite; }
.ayah-text { font-family: 'Amiri', serif; font-size: 2.2rem; line-height: 2.9; text-align: center; font-weight: 700; }
.ayah-number { display: inline-block; font-size: 1.2rem; padding-right: 15px; opacity: 0.7; }
.back-button { position: fixed; top: 15px; left: 15px; padding: 10px 18px; background-color: rgba(236, 240, 241, 0.8); backdrop-filter: blur(5px); color: #2c3e50; border: none; border-radius: 50px; font-size: 1.1rem; font-weight: bold; cursor: pointer; z-index: 100; }
#audio-player-container { padding: 10px; margin-bottom: 20px; background: rgba(13, 18, 26, 0.8); backdrop-filter: blur(10px); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 15px; }
#audio-player-container audio { width: 100%; }

/* --- Home Page --- */
.home-screen-container { position: relative; width: 100%; height: calc(100vh - 105px); overflow: hidden; display: flex; flex-direction: column; justify-content: space-between; }
.home-masjid-backdrop { position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: linear-gradient(to top, var(--bg-color) 20%, rgba(13, 18, 26, 0)), url(https://i.imgur.com/gC5574a.jpeg); background-size: cover; background-position: center bottom; opacity: 0.3; }
.prayer-times-card, .ayah-display-card { position: relative; z-index: 2; background: var(--card-bg); backdrop-filter: blur(10px); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 15px; padding: 20px; box-shadow: 0 10px 30px rgba(0,0,0,0.3); }
.prayer-times-card { margin-bottom: 20px; }
.prayer-times-card h2 { text-align: center; margin-top: 0; font-family: 'Noto Nastaliq Urdu'; color: var(--highlight-glow); }
#prayer-times-container { display: grid; grid-template-columns: repeat(auto-fit, minmax(100px, 1fr)); gap: 15px; }
.prayer-time { text-align: center; }
.prayer-time p { margin: 0; font-size: 1rem; font-family: 'Noto Nastaliq Urdu'; }
.prayer-time .time { font-size: 1.3rem; font-weight: bold; color: var(--glow-color2); font-family: 'Arial'; }
.ayah-display-card { text-align: center; }
#daily-ayah-container .ayah-arabic { font-family: 'Amiri', serif; font-size: 1.8rem; line-height: 2.5; color: var(--text-primary); text-shadow: 0 0 10px rgba(255, 221, 64, 0.5); }
#daily-ayah-container .ayah-translation { font-size: 1rem; color: #ccc; font-style: italic; margin-top: 15px; font-family: sans-serif; }

/* --- Tasbih Page --- */
.tasbih-header { text-align: center; margin-bottom: 20px; }
#tasbih-select { width: 100%; padding: 15px; background-color: var(--card-bg); border: 1px solid rgba(255,255,255,0.2); color: white; border-radius: 10px; font-family: 'Noto Nastaliq Urdu'; font-size: 1.2rem; }
.tasbih-container { display: flex; flex-direction: column; align-items: center; justify-content: center; height: calc(100vh - 150px); padding: 20px; box-sizing: border-box; }
.tasbih-counter-ring { width: 150px; height: 150px; border: 5px solid rgba(255, 255, 255, 0.2); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-bottom: 40px; box-shadow: 0 0 20px rgba(0,0,0,0.5), inset 0 0 15px rgba(0,0,0,0.5); }
.tasbih-counter { font-family: 'Arial', sans-serif; font-size: 4rem; font-weight: bold; color: var(--highlight-glow); text-shadow: 0 0 10px var(--highlight-glow); }
.tasbih-bead-wrapper { perspective: 800px; }
.tasbih-bead { width: 120px; height: 120px; border-radius: 50%; background: radial-gradient(circle at 30% 30%, #ffd54f, #ff8f00); border: none; cursor: pointer; box-shadow: 0 15px 30px rgba(0,0,0,0.6), inset 0 -10px 20px rgba(0,0,0,0.4), inset 0 5px 15px rgba(255, 255, 255, 0.3); transition: transform 0.1s ease, box-shadow 0.1s ease; transform-style: preserve-3d; }
.tasbih-bead:active { transform: scale(0.95) rotateX(15deg); box-shadow: 0 5px 15px rgba(0,0,0,0.7), inset 0 -5px 15px rgba(0,0,0,0.5), inset 0 3px 10px rgba(255, 255, 255, 0.3); }
.tasbih-controls { display: flex; align-items: center; gap: 20px; margin-top: 40px; }
.reset-button { background: none; border: 1px solid var(--text-secondary); color: var(--text-secondary); border-radius: 50%; width: 50px; height: 50px; cursor: pointer; display: flex; align-items: center; justify-content: center; }
.target-display { font-family: 'Arial'; font-size: 1.5rem; color: var(--text-secondary); }

/* --- Dua Page & 99 Names --- */
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.page-header h1 { font-family: 'Noto Nastaliq Urdu'; font-size: 2rem; margin: 0; color: var(--highlight-glow); }
#show-names-btn { background-color: var(--highlight-glow); color: black; border: none; border-radius: 20px; padding: 8px 15px; font-family: 'Noto Nastaliq Urdu'; font-weight: bold; cursor: pointer; }
#dua-categories { display: flex; flex-wrap: wrap; gap: 10px; margin-bottom: 20px; justify-content: center; }
.category-button { background-color: #323d49; border: 1px solid transparent; border-radius: 20px; padding: 8px 15px; color: var(--text-primary); cursor: pointer; font-family: 'Noto Nastaliq Urdu'; }
.category-button.active { background-color: var(--highlight-glow); color: black; font-weight: bold; }
#dua-list, #names-container { overflow-y: auto; padding: 5px; max-height: calc(100vh - 260px); }
.dua-card, .name-card { background-color: rgba(0,0,0,0.2); border-radius: 10px; padding: 15px; margin-bottom: 15px; border: 1px solid rgba(255,255,255,0.1); }
.dua-arabic, .name-arabic { font-family: 'Amiri', serif; font-size: 2rem; font-weight: 700; color: var(--highlight-glow); text-shadow: 0 0 8px var(--highlight-glow), 0 0 20px rgba(243, 156, 18, 0.5); margin: 0; text-align: right; line-height: 2; }
.dua-translation, .name-translation { font-family: 'Noto Nastaliq Urdu', sans-serif; font-size: 1rem; text-align: right; color: #ccc; margin-top: 10px; }
#names-modal .modal-content { max-height: 85vh; }

/* Modals */
.modal { display: none; position: fixed; z-index: 2000; left: 0; top: 0; width: 100%; height: 100%; background-color: rgba(0,0,0,0.7); backdrop-filter: blur(5px); align-items: center; justify-content: center; }
.modal-content { background-color: var(--chat-bg); border: 1px solid rgba(255, 255, 255, 0.2); padding: 25px 30px; border-radius: 15px; width: 90%; max-width: 500px; text-align: right; position: relative; font-family: 'Noto Nastaliq Urdu', sans-serif; direction: rtl; max-height: 80vh; display: flex; flex-direction: column; }
.close-button { z-index: 10; color: #aaa; position: absolute; top: 10px; left: 20px; font-size: 32px; font-weight: bold; cursor: pointer; }
.modal-content h2 { flex-shrink: 0; color: var(--highlight-glow); text-align: center; }
.modal-content p { line-height: 1.8; color: #ccc; }
.modal-content a { color: var(--glow-color1); text-decoration: none; }
.credits-section { overflow-y: auto; text-align: center; }
.credits-section p { text-align: right; }
.coming-soon-container { text-align: center; padding-top: 50px; opacity: 0.7; }
.coming-soon-container .material-symbols-outlined { font-size: 5rem; color: var(--highlight-glow); opacity: 0.5; }
