document.addEventListener('DOMContentLoaded', function() {

        let currentStoreGames = [];
    
    // --- PARTE 1: GESTIONE LOGIN ---
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        const usernameInput = document.getElementById('username');
        const passwordInput = document.getElementById('password');
        const errorMessage = document.getElementById('error-message');

        loginForm.addEventListener('submit', function(event) {
            event.preventDefault();
            const enteredUser = usernameInput.value.trim();
            const enteredPass = passwordInput.value.trim();

            if (enteredUser === "maoitaru" && enteredPass === "26799") {
                localStorage.setItem('gameZoneUser', enteredUser);
                window.location.href = 'index.html';
            } else {
                errorMessage.textContent = 'Access Denied: Incorrect username or password!';
                errorMessage.style.color = '#ff4d4d';
            }
        });
    }

    // --- PARTE 2: CONTROLLO ACCESSO HOME (index.html) ---
    const welcomeUserSpan = document.getElementById('welcome-user');
    if (welcomeUserSpan) {
        const loggedUser = localStorage.getItem('gameZoneUser');
        if (loggedUser) {
            welcomeUserSpan.textContent = `Logged in as: ${loggedUser}`;
        } else {
            window.location.href = 'login.html';
        }
    }

    // --- PARTE 3: GESTIONE LOGOUT ---
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(event) {
            event.preventDefault();
            localStorage.removeItem('gameZoneUser');
            window.location.href = 'login.html';
        });
    }

    // --- FUNZIONI DI SUPPORTO LIBRERIA ---
    function getMyLibrary() {
        const savedLibrary = localStorage.getItem('gameZoneLibrary');
        return savedLibrary ? JSON.parse(savedLibrary) : [];
    }

    function removeFromLibrary(gameTitle) {
        let library = getMyLibrary();
        library = library.filter(game => game.title !== gameTitle);
        localStorage.setItem('gameZoneLibrary', JSON.stringify(library));
        renderLibrary();
    }

    function renderLibrary() {
        const libraryContainer = document.getElementById('library-game-list');
        if (!libraryContainer) return;

        const library = getMyLibrary();
        libraryContainer.innerHTML = "";

        if (library.length === 0) {
            libraryContainer.innerHTML = `<p style="color: #8f98a0;">Your library is empty. Go to the Store and buy or claim some games!</p>`;
            return;
        }

        library.forEach(game => {
            const card = document.createElement('article');
            card.className = 'game-card';
            card.innerHTML = `
                <div class="game-thumbnail" style="background: url('${game.image}') center/cover; height: 140px; border-radius: 4px;"></div>
                <h4 style="margin-top: 10px;">${game.title}</h4>
                <span class="price" style="color: #66c0f4;">Owned</span>
                <div style="display: flex; gap: 10px; margin-top: 5px;">
                    <button type="button" style="flex: 1; background-color: #2a475e; border: 1px solid #66c0f4; color: #66c0f4; cursor: pointer; padding: 8px; border-radius: 4px; font-weight: bold;">Play</button>
                    <button type="button" class="remove-btn" style="background-color: #3b1d1d; border: 1px solid #ff4d4d; color: #ff4d4d; cursor: pointer; padding: 8px 12px; border-radius: 4px; font-weight: bold;" title="Remove from Library">🗑️</button>
                </div>
            `;

            const removeButton = card.querySelector('.remove-btn');
            removeButton.addEventListener('click', function() {
                removeFromLibrary(game.title);
            });

            libraryContainer.appendChild(card);
        });
    }

    function addToLibrary(gameObj) {
        const library = getMyLibrary();
        const exists = library.some(game => game.title === gameObj.title);
        
        if (!exists) {
            library.push(gameObj);
            localStorage.setItem('gameZoneLibrary', JSON.stringify(library));
            alert(`Success! "${gameObj.title}" has been added to your Library.`);
        } else {
            alert(`You already own "${gameObj.title}"! Check your Library.`);
        }
    }

    // --- PARTE 4 & 7: GESTIONE NAVIGAZIONE COMPLETA (Store, Library, Community, Support) ---
    const storeLink = document.querySelector('nav a[href="#store"]');
    const libraryLink = document.querySelector('nav a[href="#library"]');
    const communityLink = document.querySelector('nav a[href="#community"]');
    const supportLink = document.querySelector('nav a[href="#support"]');

    const storeView = document.getElementById('store-view');
    const libraryView = document.getElementById('library-view');
    const communityView = document.getElementById('community-view');
    const supportView = document.getElementById('support-view');

    function hideAllViews() {
        if (storeView) storeView.style.display = 'none';
        if (libraryView) libraryView.style.display = 'none';
        if (communityView) communityView.style.display = 'none';
        if (supportView) supportView.style.display = 'none';
    }

    if (storeLink) {
        storeLink.addEventListener('click', function(e) {
            e.preventDefault();
            hideAllViews();
            if (storeView) storeView.style.display = 'block';
        });
    }

    if (libraryLink) {
        libraryLink.addEventListener('click', function(e) {
            e.preventDefault();
            hideAllViews();
            if (libraryView) libraryView.style.display = 'block';
            renderLibrary();
        });
    }

    if (communityLink) {
        communityLink.addEventListener('click', function(e) {
            e.preventDefault();
            hideAllViews();
            if (communityView) communityView.style.display = 'block';
            renderCommunityPosts();
        });
    }

    if (supportLink) {
        supportLink.addEventListener('click', function(e) {
            e.preventDefault();
            hideAllViews();
            if (supportView) supportView.style.display = 'block';
        });
    }

    // --- PARTE 5: GENERATORE RANDOM DI GIOCHI & STORE ---
    const dynamicGameList = document.getElementById('dynamic-game-list');
    const generateBtn = document.getElementById('generate-more-btn');

    const prefixes = ["Cyber", "Shadow", "Neon", "Pixel", "Star", "Dark", "Super", "Galactic", "Dragon", "Retro"];
    const nouns = ["Quest", "Odyssey", "Legends", "Warfare", "Chronicles", "Runner", "Protocol", "Hunter", "Valhalla", "Empire"];
    const genres = ["Action", "RPG", "Indie", "Strategy", "Sci-Fi", "Horror", "Simulator", "Adventure"];
    
    const gameImages = [
        "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400",
        "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=400",
        "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=400",
        "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=400",
        "https://images.unsplash.com/photo-1612287230202-1ff1d85d1bdf?w=400"
    ];

    function getRandomElement(array) {
        return array[Math.floor(Math.random() * array.length)];
    }

    function getRandomPrice() {
        const isFree = Math.random() < 0.2;
        if (isFree) return "Free to Play";
        const price = (Math.random() * 50 + 4.99).toFixed(2);
        return `$${price}`;
    }

    function renderStoreGames(gamesToRender) {
        if (!dynamicGameList) return;
        dynamicGameList.innerHTML = "";

        if (gamesToRender.length === 0) {
            dynamicGameList.innerHTML = `<p style="color: #8f98a0;">No games found matching your search.</p>`;
            return;
        }

        gamesToRender.forEach(game => {
            const gameCard = document.createElement('article');
            gameCard.className = 'game-card';
            gameCard.innerHTML = `
                <div class="game-thumbnail" style="background: url('${game.image}') center/cover; height: 140px; border-radius: 4px;"></div>
                <h4 style="margin-top: 10px;">${game.title}</h4>
                <p style="font-size: 0.8rem; color: #8f98a0; margin: 2px 0;">Genre: ${game.genre}</p>
                <span class="price">${game.price}</span>
                <button type="button" class="buy-btn" style="padding: 8px; background-color: #5c7e10; border: none; border-radius: 4px; color: white; font-weight: bold; cursor: pointer;">Buy Now</button>
            `;

            const buyButton = gameCard.querySelector('.buy-btn');
            buyButton.addEventListener('click', function() {
                addToLibrary(game);
            });

            dynamicGameList.appendChild(gameCard);
        });
    }
    
    function generateRandomGames(count = 8) {
        if (!dynamicGameList) return;
        currentStoreGames = [];

        for (let i = 0; i < count; i++) {
            const title = `${getRandomElement(prefixes)} ${getRandomElement(nouns)} ${Math.floor(Math.random() * 3) + 1}`;
            const genre = getRandomElement(genres);
            const price = getRandomPrice();
            const image = getRandomElement(gameImages);

            const gameData = { title, genre, price, image };
            currentStoreGames.push(gameData);
        }

        renderStoreGames(currentStoreGames);
    }

   const filterButtons = document.querySelectorAll('.filter-btn');
    if (filterButtons.length > 0) {
        filterButtons.forEach(button => {
            button.addEventListener('click', function() {
                const selectedGenre = this.getAttribute('data-genre');

                if (selectedGenre === 'all') {
                    renderStoreGames(currentStoreGames);
                } else {
                    const filteredGames = currentStoreGames.filter(game => game.genre === selectedGenre);
                    renderStoreGames(filteredGames);
                }
            });
        });
    }

    const searchBar = document.getElementById('search-bar');
    if (searchBar) {
        searchBar.addEventListener('input', function(e) {
            const searchTerm = e.target.value.toLowerCase().trim();
            const filteredGames = currentStoreGames.filter(game => game.title.toLowerCase().includes(searchTerm));
            renderStoreGames(filteredGames);
        });
    }

    const featuredBuyBtn = document.querySelector('.buy-featured-btn');
    if (featuredBuyBtn) {
        featuredBuyBtn.addEventListener('click', function() {
            addToLibrary({
                title: "Cyber Quest 2077",
                image: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400",
                price: "$59.99"
            });
        });
    }

    if (dynamicGameList) {
        generateRandomGames(8);
    }

    if (generateBtn) {
        generateBtn.addEventListener('click', function() {
            generateRandomGames(8);
        });
    }

    // --- PARTE 8: GESTIONE COMMUNITY ---
    const postSubmitBtn = document.getElementById('post-submit-btn');
    const communityPostInput = document.getElementById('community-post-input');
    const communityFeed = document.getElementById('community-feed');

    function getCommunityPosts() {
        const savedPosts = localStorage.getItem('gameZonePosts');
        return savedPosts ? JSON.parse(savedPosts) : [
            { author: "maoitaru", text: "Welcome to GameZone! This platform is looking amazing.", date: "Today" },
            { author: "GamerPro99", text: "Cyber Quest 2077 is an absolute masterpiece. Who else is playing it?", date: "Yesterday" }
        ];
    }

    function renderCommunityPosts() {
        if (!communityFeed) return;
        const posts = getCommunityPosts();
        communityFeed.innerHTML = "";

        posts.forEach(post => {
            const postCard = document.createElement('div');
            postCard.className = 'post-card';
            postCard.innerHTML = `
                <div class="post-header">
                    <strong class="post-author">${post.author}</strong>
                    <span class="post-date">${post.date}</span>
                </div>
                <p class="post-text">${post.text}</p>
            `;
            communityFeed.appendChild(postCard);
        });
    }

    if (postSubmitBtn) {
        postSubmitBtn.addEventListener('click', function() {
            const text = communityPostInput.value.trim();
            if (text === "") {
                alert("Please write something before posting!");
                return;
            }

            const currentUser = localStorage.getItem('gameZoneUser') || "Gamer";
            const newPost = {
                author: currentUser,
                text: text,
                date: "Just now"
            };

            const posts = getCommunityPosts();
            posts.unshift(newPost);
            localStorage.setItem('gameZonePosts', JSON.stringify(posts));

            communityPostInput.value = "";
            renderCommunityPosts();
        });
    }

    // --- PARTE 9: GESTIONE SUPPORT ---
    const supportForm = document.getElementById('support-form');
    const supportSuccessMsg = document.getElementById('support-success-msg');

    if (supportForm) {
        supportForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const issueType = document.getElementById('support-issue').value;
            const message = document.getElementById('support-message').value;

            if (message.trim() !== "") {
                supportSuccessMsg.textContent = `Ticket submitted successfully! Our support team will review your "${issueType}" request shortly.`;
                supportSuccessMsg.style.display = 'block';
                supportForm.reset();

                setTimeout(() => {
                    supportSuccessMsg.style.display = 'none';
                }, 5000);
            }
        });
    }

}); // <-- QUESTA È L'UNICA CHIUSURA FINALE DEL DOMContentLoaded PER TUTTO IL SCRIPT!