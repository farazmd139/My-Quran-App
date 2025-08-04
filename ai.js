document.addEventListener('DOMContentLoaded', () => {
    // --- Global Variables & API Key ---
    const GEMINI_API_KEY = 'AIzaSyDB4TUj3zsU90jCfI8L0yivvWIYipUtq3c';

    // --- DOM Elements ---
    const menuButton = document.getElementById('menu-button');
    const sideMenu = document.getElementById('side-menu');
    const menuOverlay = document.getElementById('menu-overlay');
    const chatMessages = document.getElementById('chat-messages');
    const chatInput = document.getElementById('chat-input');
    const sendChatButton = document.getElementById('send-chat-button');
    
    // --- Side Menu Logic ---
    menuButton.addEventListener('click', () => {
        sideMenu.classList.toggle('open');
        menuOverlay.classList.toggle('open');
    });
    menuOverlay.addEventListener('click', () => {
        sideMenu.classList.remove('open');
        menuOverlay.classList.remove('open');
    });

    // --- AI Chat Functionality ---
    chatInput.addEventListener('keypress', (event) => { 
        if (event.key === 'Enter') {
            sendMessage();
        } 
    });
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
            contents: [{ 
                parts: [{ 
                    text: `You are "Faraz," a learned Islamic scholar AI assistant. Your knowledge is based on the Quran, Tafsir (like Ibn Kathir, At-Tabari), and authentic Hadith collections (Sahih al-Bukhari, Sahih Muslim, Jami' at-Tirmidhi, etc.). When a user asks a question, provide a detailed, accurate, and respectful answer in the same language they used (Urdu, Hindi, or English). If possible, cite your sources (e.g., Quran 2:183, Sahih al-Bukhari 5678). Be comprehensive but easy to understand. User's question: "${question}"` 
                }] 
            }]
        };

        try {
            const response = await fetch(API_URL, { 
                method: 'POST', 
                headers: { 'Content-Type': 'application/json' }, 
                body: JSON.stringify(requestData) 
            });
            
            if (!response.ok) { 
                const errorData = await response.json();
                console.error('Google AI Error:', errorData);
                throw new Error('Network response was not ok'); 
            }
            
            const data = await response.json();
            const aiResponse = data.candidates[0].content.parts[0].text;
            
            typingMessage.innerHTML = '';
            typingMessage.innerText = aiResponse;

        } catch (error) {
            console.error("AI से बात करने में خرابی:", error);
            typingMessage.innerText = "معافی चाहता हूं, अभी मैं जवाब नहीं दे सकता। कृपया अपनी API Key जांचें या बाद में कोशिश करें।";
        }
    }

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
});
