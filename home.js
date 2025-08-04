document.addEventListener('DOMContentLoaded', () => {
    const prayerTimeContainer = document.getElementById('prayer-times-container');
    const dailyAyahContainer = document.getElementById('daily-ayah-container');
    const prayerTimeLoader = document.getElementById('prayer-time-loader');

    const dailyAyahs = [
        { arabic: "فَبِأَيِّ آلَاءِ رَبِّكُمَا تُكَذِّبَانِ", translation: "پس تم अपने रब की कौन-कौन सी نعمتوں को جھٹلاؤ گے؟" },
        { arabic: "إِنَّ مَعَ الْعُسْرِ يُسْرًا", translation: "بے شک हर मुश्किल के साथ آسانی ہے۔" },
        { arabic: "وَمَنْ يَتَوَكَّلْ عَلَى اللَّهِ فَهُوَ حَسْبُهُ", translation: "और जो अल्लाह पर بھروسہ करता है, तो वह उसके लिए کافی ہے۔" }
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
        const requiredTimings = {
            'Fajr': 'فجر',
            'Dhuhr': 'ظہر',
            'Asr': 'عصر',
            'Maghrib': 'مغرب',
            'Isha': 'عشاء'
        };
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
        dailyAyahContainer.innerHTML = `
            <p class="ayah-arabic">${ayah.arabic}</p>
            <p class="ayah-translation">${ayah.translation}</p>
        `;
    }

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
    setInterval(showRandomAyah, 600000); // 10 minutes
});
