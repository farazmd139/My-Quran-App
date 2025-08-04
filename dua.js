document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const menuButton = document.getElementById('menu-button');
    const sideMenu = document.getElementById('side-menu');
    const menuOverlay = document.getElementById('menu-overlay');
    const duaCategoriesContainer = document.getElementById('dua-categories');
    const duaListContainer = document.getElementById('dua-list');
    const namesContainer = document.getElementById('names-container');
    const showNamesBtn = document.getElementById('show-names-btn');

    // --- Side Menu Logic ---
    menuButton.addEventListener('click', () => {
        sideMenu.classList.toggle('open');
        menuOverlay.classList.toggle('open');
    });
    menuOverlay.addEventListener('click', () => {
        sideMenu.classList.remove('open');
        menuOverlay.classList.remove('open');
    });

    // --- Data for Duas, Kalmas, Hadiths & 99 Names ---
    const allContent = [
        // 6 Kalmas
        { category: "کلمے", arabic: "لَا إِلَهَ إِلَّا اللَّهُ مُحَمَّدٌ رَسُولُ اللَّهِ", translation: "کوئی معبود نہیں سوائے اللہ کے، محمد صلی اللہ علیہ وسلم اللہ کے رسول ہیں۔" },
        { category: "کلمے", arabic: "أَشْهَدُ أَنْ لَا إِلَهَ إِلَّا اللَّهُ وَأَشْهَدُ أَنَّ مُحَمَّدًا عَبْدُهُ وَرَسُولُهُ", translation: "میں گواہی دیتا ہوں کہ کوئی معبود نہیں سوائے اللہ کے، اور میں گواہی دیتا ہوں کہ محمد صلی اللہ علیہ وسلم اس کے بندے اور رسول ہیں۔" },
        { category: "کلمے", arabic: "سُبْحَانَ اللَّهِ وَالْحَمْدُ لِلَّهِ وَلَا إِلَهَ إِلَّا اللَّهُ وَاللَّهُ أَكْبَرُ", translation: "اللہ پاک ہے، تمام تعریفیں اللہ کے لیے ہیں، کوئی معبود نہیں سوائے اللہ کے، اور اللہ سب سے بڑا ہے۔" },
        { category: "کلمے", arabic: "لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ يُحْيِي وَيُمِيتُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ", translation: "کوئی معبود نہیں سوائے اللہ کے، وہ اکیلا ہے، اس کا کوئی شریک نہیں، اسی کے لیے بادشاہی ہے اور اسی کے لیے حمد ہے، وہ زندہ کرتا ہے اور مارتا ہے، اور وہ ہر چیز پر قادر ہے۔" },
        { category: "کلمے", arabic: "أَسْتَغْفِرُ اللَّهَ رَبِّي مِنْ كُلِّ ذَنْبٍ وَأَتُوبُ إِلَيْهِ", translation: "میں اپنے رب اللہ سے ہر گناہ کی مغفرت مانگتا ہوں اور اس کی طرف توبہ کرتا ہوں۔" },
        { category: "کلمے", arabic: "اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنْ أَنْ أُشْرِكَ بِكَ شَيْئًا وَأَنَا أَعْلَمُ، وَأَسْتَغْفِرُكَ لِمَا لَا أَعْلَمُ", translation: "اے اللہ! میں تیری پناہ مانگتا ہوں اس سے کہ میں جانتے ہوئے تیرے ساتھ کسی کو شریک کروں، اور اس کے لیے مغفرت مانگتا ہوں جو میں نہیں جانتا۔" },
        
        // 50 Duas
        { category: "دعائیں", arabic: "اَللّٰھُمَّ اِنِّیْ اَسْئَلُکَ الْعَفْوَ وَالْعَافِیَةَ فِی الدُّنْیَا وَالْآخِرَةِ", translation: "اے اللہ! میں تجھ سے دنیا اور آخرت میں معافی اور عافیت مانگتا ہوں۔" },
        { category: "دعائیں", arabic: "رَبَّنَا آتِنَا فِی الدُّنْیَا حَسَنَةً وَّفِی الْآخِرَةِ حَسَنَةً وَّقِنَا عَذَابَ النَّارِ", translation: "اے ہمارے رب! ہمیں دنیا میں بھلائی عطا فرما اور آخرت میں بھلائی عطا فرما اور ہمیں آگ کے عذاب سے بچا۔" },
        { category: "دعائیں", arabic: "اَللّٰھُمَّ اجْعَلْنِیْ شَکُوْرًا وَّاجْعَلْنِیْ صَبُوْرًا", translation: "اے اللہ! مجھے شکر کرنے والا اور صبر کرنے والا بنا۔" },
        { category: "دعائیں", arabic: "اَللّٰھُمَّ اغْفِرْ لِیْ وَلِوَالِدَیَّ وَلِلْمُؤْمِنِیْنَ", translation: "اے اللہ! میری، میرے والدین کی اور تمام مومنوں کی مغفرت فرما۔" },
        { category: "دعائیں", arabic: "رَبِّ اغْفِرْ وَارْحَمْ وَاَنْتَ خَیْرُ الرَّاحِمِیْنَ", translation: "اے رب! معاف کر اور رحم فرما، تو سب سے بہتر رحم کرنے والا ہے۔" },
        { category: "دعائیں", arabic: "اَللّٰھُمَّ اِنِّیْ اَعُوْذُ بِکَ مِنَ الْعَجْزِ وَالْکَسَلِ", translation: "اے اللہ! میں تیری پناہ مانگتا ہوں عاجزی اور سستی سے۔" },
        { category: "دعائیں", arabic: "اَللّٰھُمَّ اِنِّیْ اَسْئَلُکَ الْہُدٰی وَالتُّقٰی وَالْعَفَافَ وَالْغِنٰی", translation: "اے اللہ! میں تجھ سے ہدایت، تقویٰ، پاکدامنی اور بے نیازی مانگتا ہوں۔" },
        { category: "دعائیں", arabic: "رَبِّ زِدْنِیْ عِلْمًا", translation: "اے رب! مجھے علم میں اضافہ فرما۔" },
        { category: "دعائیں", arabic: "اَللّٰھُمَّ اہْدِنِیْ وَسَدِّدْنِیْ", translation: "اے اللہ! مجھے ہدایت دے اور میری راہ درست کر۔" },
        { category: "دعائیں", arabic: "اَللّٰھُمَّ لَا سَھْلَ اِلَّا مَا جَعَلْتَہُ سَھْلًا", translation: "اے اللہ! کوئی چیز آسان نہیں سوائے اس کے جو تو آسان کر دے۔" },
        { category: "دعائیں", arabic: "اَللّٰھُمَّ اِنِّیْ اَعُوْذُ بِکَ مِنْ شَرِّ مَا عَمِلْتُ وَمَا لَمْ اَعْمَلْ", translation: "اے اللہ! میں تیری پناہ مانگتا ہوں اس شر سے جو میں نے کیا اور جو نہیں کیا۔" },
        { category: "دعائیں", arabic: "رَبِّ اِنِّیْ ظَلَمْتُ نَفْسِیْ فَاغْفِرْ لِیْ", translation: "اے رب! میں نے اپنی جان پر ظلم کیا، سو مجھے معاف فرما۔" },
        { category: "دعائیں", arabic: "اَللّٰھُمَّ اِنِّیْ اَسْئَلُکَ الْجَنَّةَ وَاَعُوْذُ بِکَ مِنَ النَّارِ", translation: "اے اللہ! میں تجھ سے جنت مانگتا ہوں اور دوزخ سے پناہ مانگتا ہوں۔" },
        { category: "دعائیں", arabic: "اَللّٰھُمَّ ارْزُقْنِیْ حُبَّکَ وَحُبَّ مَنْ یُحِبُّکَ", translation: "اے اللہ! مجھے تیری محبت اور اس کی محبت عطا فرما جو تجھ سے محبت کرتا ہو۔" },
        { category: "دعائیں", arabic: "رَبِّ ھَبْ لِیْ حُکْمًا وَّاَلْحِقْنِیْ بِالصَّالِحِیْنَ", translation: "اے رب! مجھے حکمت عطا فرما اور مجھے صالحین کے ساتھ ملا۔" },
        { category: "دعائیں", arabic: "اَللّٰھُمَّ اِنِّیْ اَسْئَلُکَ رِضَاکَ وَالْجَنَّةَ", translation: "اے اللہ! میں تجھ سے تیری رضا اور جنت مانگتا ہوں۔" },
        { category: "دعائیں", arabic: "اَللّٰھُمَّ اجْعَلْ خَیْرَ عُمْرِیْ آخِرَہُ", translation: "اے اللہ! میری عمر کا بہترین حصہ اس کا آخر بنا۔" },
        { category: "دعائیں", arabic: "اَللّٰھُمَّ اِنِّیْ اَعُوْذُ بِکَ مِنْ زَوَالِ نِعْمَتِکَ", translation: "اے اللہ! میں تیری پناہ مانگتا ہوں تیری نعمت کے زوال سے۔" },
        { category: "دعائیں", arabic: "رَبِّ اشْرَحْ لِیْ صَدْرِیْ وَیَسِّرْ لِیْ اَمْرِیْ", translation: "اے رب! میرا سینہ کھول دے اور میرا کام آسان کر دے۔" },
        { category: "دعائیں", arabic: "اَللّٰھُمَّ سَتِّرْ عَوْرَاتِیْ وَآمِنْ رَوْعَاتِیْ", translation: "اے اللہ! میری عیبوں کو چھپا اور میری پریشانیوں کو امن عطا فرما۔" },
        { category: "دعائیں", arabic: "اَللّٰھُمَّ اِنِّیْ اَعُوْذُ بِکَ مِنَ الْفِتْنَةِ فِی الدُّنْیَا وَالْآخِرَةِ", translation: "اے اللہ! میں تیری پناہ مانگتا ہوں دنیا اور آخرت کے فتنوں سے۔" },
        { category: "دعائیں", arabic: "اَللّٰھُمَّ اغْفِرْ لِیْ ذَنْبِیْ وَوَسِّعْ لِیْ فِیْ دَارِیْ", translation: "اے اللہ! میرا گناہ معاف کر اور میرے گھر میں وسعت عطا فرما۔" },
        { category: "دعائیں", arabic: "رَبِّ اَنْزِلْنِیْ مُنْزَلًا مُّبَارَکًا", translation: "اے رب! مجھے بابرکت جگہ اتار۔" },
        { category: "دعائیں", arabic: "اَللّٰھُمَّ اِنِّیْ اَسْئَلُکَ الْعَفْوَ وَالْمَغْفِرَةَ", translation: "اے اللہ! میں تجھ سے معافی اور مغفرت مانگتا ہوں۔" },
        { category: "دعائیں", arabic: "اَللّٰھُمَّ بَارِکْ لِیْ فِیْ رِزْقِیْ", translation: "اے اللہ! میرے رزق میں برکت عطا فرما۔" },
        { category: "دعائیں", arabic: "اَللّٰھُمَّ اِنِّیْ اَعُوْذُ بِکَ مِنْ جَھْدِ الْبَلَاءِ", translation: "اے اللہ! میں تیری پناہ مانگتا ہوں شدید مصیبت سے۔" },
        { category: "دعائیں", arabic: "رَبِّ اجْعَلْنِیْ مُقِیْمَ الصَّلٰوةِ وَمِنْ ذُرِّیَّتِیْ", translation: "اے رب! مجھے اور میری اولاد کو نماز قائم کرنے والا بنا۔" },
        { category: "دعائیں", arabic: "اَللّٰھُمَّ اِنِّیْ اَسْئَلُکَ نَفْسًا مُّطْمَئِنَّةً", translation: "اے اللہ! میں تجھ سے اطمینان قلب مانگتا ہوں۔" },
        { category: "دعائیں", arabic: "اَللّٰھُمَّ حَاسِبْنِیْ حِسَابًا یَسِیْرًا", translation: "اے اللہ! میرا حساب آسان کر۔" },
        { category: "دعائیں", arabic: "رَبِّ تَقَبَّلْ تَوْبَتِیْ وَاغْسِلْ حَوْبَتِیْ", translation: "اے رب! میری توبہ قبول فرما اور میری خطائیں دھو دے۔" },
        { category: "دعائیں", arabic: "اَللّٰھُمَّ ارْزُقْنِیْ تَوْفِیْقَ طَاعَتِکَ", translation: "اے اللہ! مجھے تیری اطاعت کی توفیق عطا فرما۔" },
        { category: "دعائیں", arabic: "اَللّٰھُمَّ اِنِّیْ اَعُوْذُ بِکَ مِنْ ضِیْقِ الدُّنْیَا", translation: "اے اللہ! میں تیری پناہ مانگتا ہوں دنیا کی تنگی سے۔" },
        { category: "دعائیں", arabic: "رَبِّ اَدْخِلْنِیْ مُدْخَلَ صِدْقٍ وَّاَخْرِجْنِیْ مُخْرَجَ صِدْقٍ", translation: "اے رب! مجھے سچائی کے ساتھ داخل کر اور سچائی کے ساتھ نکال۔" },
        { category: "دعائیں", arabic: "اَللّٰھُمَّ اِنِّیْ اَسْئَلُکَ خَیْرَ الْمَسْئَلَةِ", translation: "اے اللہ! میں تجھ سے بہترین دعا مانگتا ہوں۔" },
        { category: "دعائیں", arabic: "اَللّٰھُمَّ اجْعَلْنِیْ مِنَ التَّوَّابِیْنَ", translation: "اے اللہ! مجھے توبہ کرنے والوں میں سے کر۔" },
        { category: "دعائیں", arabic: "اَللّٰھُمَّ اِنِّیْ اَعُوْذُ بِکَ مِنْ عَذَابِ الْقَبْرِ", translation: "اے اللہ! میں تیری پناہ مانگتا ہوں قبر کے عذاب سے۔" },
        { category: "دعائیں", arabic: "رَبِّ لَا تَذَرْنِیْ فَرْدًا وَّاَنْتَ خَیْرُ الْوَارِثِیْنَ", translation: "اے رب! مجھے اکیلا نہ چھوڑ اور تو سب سے بہتر وارث ہے۔" },
        { category: "دعائیں", arabic: "اَللّٰھُمَّ اِنِّیْ اَسْئَلُکَ الْفَوْزَ فِی الْآخِرَةِ", translation: "اے اللہ! میں تجھ سے آخرت میں کامیابی مانگتا ہوں۔" },
        { category: "دعائیں", arabic: "اَللّٰھُمَّ اَصْلِحْ لِیْ دِیْنِیْ وَدُنْیَایَ", translation: "اے اللہ! میرے دین اور دنیا کو درست فرما۔" },
        { category: "دعائیں", arabic: "اَللّٰھُمَّ اِنِّیْ اَعُوْذُ بِکَ مِنَ الْہَمِّ وَالْحَزَنِ", translation: "اے اللہ! میں تیری پناہ مانگتا ہوں غم اور رنج سے۔" },
        { category: "دعائیں", arabic: "رَبِّ هَبْ لِیْ مِنْ لَدُنْکَ ذُرِّیَّةً طَیِّبَةً", translation: "اے رب! مجھے اپنے پاس سے پاکیزہ اولاد عطا فرما۔" },
        { category: "دعائیں", arabic: "اَللّٰھُمَّ اِنِّیْ اَسْئَلُکَ الْعِزَّةَ وَالنَّصْرَ", translation: "اے اللہ! میں تجھ سے عزت اور نصرت مانگتا ہوں۔" },
        { category: "دعائیں", arabic: "اَللّٰھُمَّ اجْعَلْ لِیْ نُوْرًا فِیْ قَلْبِیْ", translation: "اے اللہ! میرے دل میں نور عطا فرما۔" },
        { category: "دعائیں", arabic: "اَللّٰھُمَّ اِنِّیْ اَعُوْذُ بِکَ مِنْ شَرِّ النَّفْسِ", translation: "اے اللہ! میں تیری پناہ مانگتا ہوں نفس کے شر سے۔" },
        { category: "دعائیں", arabic: "رَبِّ قِنِیْ عَذَابَکَ یَوْمَ تَبْعَثُ عِبَادَکَ", translation: "اے رب! مجھے اس دن اپنے عذاب سے بچا جب تو اپنے بندوں کو اٹھائے گا۔" },
        { category: "دعائیں", arabic: "اَللّٰھُمَّ ارْزُقْنِیْ الصِّحَّةَ وَالسَّعَادَةَ", translation: "اے اللہ! مجھے صحت اور خوشی عطا فرما۔" },
        { category: "دعائیں", arabic: "اَللّٰھُمَّ اِنِّیْ اَسْئَلُکَ الْیُسْرَ بَعْدَ الْعُسْرِ", translation: "اے اللہ! میں تجھ سے دشواری کے بعد آسانی مانگتا ہوں۔" },
        { category: "دعائیں", arabic: "اَللّٰھُمَّ اجْعَلْنِیْ مِنَ الْمُتَّقِیْنَ", translation: "اے اللہ! مجھے متقیوں میں سے کر۔" },
        { category: "دعائیں", arabic: "اَللّٰھُمَّ اِنِّیْ اَعُوْذُ بِکَ مِنْ شَرِّ الْفِتَنِ", translation: "اے اللہ! میں تیری پناہ مانگتا ہوں فتنوں کے شر سے۔" },
        { category: "دعائیں", arabic: "اَللّٰھُمَّ تَقَبَّلْ مِنِّیْ صَلَاتِیْ وَدُعَائِیْ", translation: "اے اللہ! میری نماز اور دعا قبول فرما۔" },

        // 40 Hadiths
        { category: "احادیث", arabic: "إِنَّمَا الأَعْمَالُ بِالنِّيَّاتِ", translation: "اعمال کا دارومدار نیتوں پر ہے۔ (صحیح بخاری: 1)" },
        { category: "احادیث", arabic: "الدِّينُ النَّصِيحَةُ", translation: "دین خیرخواہی ہے۔ (صحیح مسلم: 55)" },
        { category: "احادیث", arabic: "خَيْرُكُمْ مَنْ تَعَلَّمَ الْقُرْآنَ وَعَلَّمَهُ", translation: "تم میں سب سے بہتر وہ ہے جو قرآن سیکھے اور سکھائے۔ (صحیح بخاری: 5027)" },
        // ... (तुम्हारी दी हुई बाकी की 37 हदीसें यहाँ आएंगी)
    ];

    const namesData = [
        {"name": "الرحمن", "transliteration": "Ar-Rahman", "ur_meaning": "بہت مہربان"},
        {"name": "الرحيم", "transliteration": "Ar-Rahim", "ur_meaning": "نہایت رحم والا"},
        // ... (यहाँ अल्लाह के सभी 99 नाम और उनके उर्दू अनुवाद आएंगे)
    ];

    // --- Side Menu Logic ---
    // ... (यह पूरा सेक्शन वैसा ही रहेगा)

    // --- Dua & 99 Names Functionality ---
    function loadContentData() {
        const categories = [...new Set(allContent.map(item => item.category))];
        displayDuaCategories(categories);
        filterContent(categories[0]); // Show the first category by default
    }

    function displayDuaCategories(categories) {
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
        }
    }

    function filterContent(category) {
        const items = allContent.filter(item => item.category === category);
        duaListContainer.innerHTML = '';
        items.forEach(item => {
            const card = document.createElement('div');
            card.className = 'dua-card';
            card.innerHTML = `<p class="dua-arabic">${item.arabic}</p><p class="dua-translation">${item.translation}</p>`;
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

    // --- Modal & Menu Links ---
    window.openModal = function(modalId) {
        closeAllModals();
        document.getElementById(modalId).style.display = 'flex';
        if (modalId === 'names-modal' && namesContainer.innerHTML === '') {
            displayNames(namesData);
        }
    }
    // ... (बाकी का Modal का लॉजिक वैसा ही रहेगा)

    // --- Event Listeners for Dua Page ---
    showNamesBtn.addEventListener('click', () => openModal('names-modal'));
    
    // --- Initial Load for this page ---
    loadContentData();
});
