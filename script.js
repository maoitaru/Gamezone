document.addEventListener('DOMContentLoaded', function() {

    let currentStoreGames = [];

    // --- PARTE 1: GESTIONE LOGIN ---
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        const usernameInput = document.getElementById('username');
        const passwordInput = document.getElementById('password');
        const errorMessage = document.getElementById('error-message');

        loginForm.addEventListener('submit', async function(event) {
            event.preventDefault();
            const username = usernameInput.value.trim();
            const password = passwordInput.value.trim();

            try {
                const response = await fetch('/api/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username, password })
                });

                const data = await response.json();

                if (data.success) {
                    localStorage.setItem('gameZoneUser', data.username);
                    window.location.href = 'index.html';
                } else {
                    errorMessage.textContent = data.message || 'Credenziali errate!';
                    errorMessage.style.color = '#ff4d4d';
                }
            } catch (err) {
                errorMessage.textContent = 'Errore di connessione al server!';
                errorMessage.style.color = '#ff4d4d';
            }
        });
    }

    // --- GESTIONE REGISTRAZIONE (FETCH BACKEND) ---
    const registerForm = document.getElementById('register-form');
    if (registerForm) {
        const newUsernameInput = document.getElementById('new-username');
        const newPasswordInput = document.getElementById('new-password');
        const registerErrorMessage = document.getElementById('register-error-message');

        registerForm.addEventListener('submit', async function(event) {
            event.preventDefault();
            const username = newUsernameInput.value.trim();
            const password = newPasswordInput.value.trim();

            try {
                const response = await fetch('/api/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username, password })
                });

                const data = await response.json();

                if (data.success) {
                    alert('Registration successful! You can now sign in.');
                    window.location.href = 'login.html';
                } else {
                    registerErrorMessage.textContent = data.message || 'Error during registration.';
                    registerErrorMessage.style.color = '#ff4d4d';
                }
            } catch (error) {
                console.error("Network error:", error);
                registerErrorMessage.textContent = 'Server connection error!';
                registerErrorMessage.style.color = '#ff4d4d';
            }
        });
    }

    // --- PARTE 2: CONTROLLO ACCESSO HOME ---
    const welcomeUserSpan = document.getElementById('welcome-user');
    const loggedUser = localStorage.getItem('gameZoneUser');

    if (welcomeUserSpan) {
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

    // --- GESTIONE LIBRERIA (FETCH BACKEND) ---
    async function renderLibrary() {
        const libraryContainer = document.getElementById('library-game-list');
        if (!libraryContainer || !loggedUser) return;

        try {
            const res = await fetch(`/api/library/${loggedUser}`);
            const library = await res.json();

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
                        <button type="button" class="remove-btn" style="background-color: #3b1d1d; border: 1px solid #ff4d4d; color: #ff4d4d; cursor: pointer; padding: 8px 12px; border-radius: 4px; font-weight: bold;" title="Remove">🗑️</button>
                    </div>
                `;

                card.querySelector('.remove-btn').addEventListener('click', async () => {
                    await fetch('/api/library/remove', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ username: loggedUser, gameTitle: game.title })
                    });
                    renderLibrary();
                });

                libraryContainer.appendChild(card);
            });
        } catch (err) {
            console.error("Errore caricamento libreria:", err);
        }
    }

    async function addToLibrary(gameObj) {
        if (!loggedUser) return;

        try {
            const res = await fetch('/api/library/add', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: loggedUser, game: gameObj })
            });

            const data = await res.json();
            alert(data.message);
        } catch (err) {
            alert("Errore durante l'aggiunta alla libreria.");
        }
    }

    // --- NAVIGAZIONE VISTE ---
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

    if (storeLink) storeLink.addEventListener('click', (e) => { e.preventDefault(); hideAllViews(); storeView.style.display = 'block'; });
    if (libraryLink) libraryLink.addEventListener('click', (e) => { e.preventDefault(); hideAllViews(); libraryView.style.display = 'block'; renderLibrary(); });
    if (communityLink) communityLink.addEventListener('click', (e) => { e.preventDefault(); hideAllViews(); communityView.style.display = 'block'; renderCommunityPosts(); });
    if (supportLink) supportLink.addEventListener('click', (e) => { e.preventDefault(); hideAllViews(); supportView.style.display = 'block'; });

// --- GENERATORE STORE & FILTRI ---
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

    function getRandomElement(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
    function getRandomPrice() { return (Math.random() < 0.2) ? "Free to Play" : `$${(Math.random() * 50 + 4.99).toFixed(2)}`; }

    function renderStoreGames(games) {
        if (!dynamicGameList) return;
        dynamicGameList.innerHTML = "";

        if (games.length === 0) {
            dynamicGameList.innerHTML = `<p style="color: #8f98a0; padding: 20px;">No games found for this genre.</p>`;
            return;
        }

        games.forEach(game => {
            const card = document.createElement('article');
            card.className = 'game-card';
            card.innerHTML = `
                <div class="game-thumbnail" style="background: url('${game.image}') center/cover; height: 140px; border-radius: 4px;"></div>
                <h4 style="margin-top: 10px;">${game.title}</h4>
                <p style="font-size: 0.8rem; color: #8f98a0; margin: 2px 0;">Genre: ${game.genre}</p>
                <span class="price">${game.price}</span>
                <button type="button" class="buy-btn" style="padding: 8px; background-color: #5c7e10; border: none; border-radius: 4px; color: white; font-weight: bold; cursor: pointer;">Buy Now</button>
            `;
            card.querySelector('.buy-btn').addEventListener('click', () => addToLibrary(game));
            dynamicGameList.appendChild(card);
        });
    }

    function generateRandomGames(count = 12) {
        currentStoreGames = [];
        for (let i = 0; i < count; i++) {
            currentStoreGames.push({
                title: `${getRandomElement(prefixes)} ${getRandomElement(nouns)} ${Math.floor(Math.random() * 3) + 1}`,
                genre: getRandomElement(genres),
                price: getRandomPrice(),
                image: getRandomElement(gameImages)
            });
        }
        renderStoreGames(currentStoreGames);
    }

    if (dynamicGameList) generateRandomGames(12);
    if (generateBtn) generateBtn.addEventListener('click', () => generateRandomGames(12));

    // --- GESTIONE CLICK FILTRI ---
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            filterButtons.forEach(btn => btn.classList.remove('active'));
            e.target.classList.add('active');

            const selectedGenre = e.target.getAttribute('data-genre');

            if (selectedGenre === 'All' || selectedGenre === 'all') {
                renderStoreGames(currentStoreGames);
            } else {
                const filtered = currentStoreGames.filter(g => g.genre === selectedGenre);
                renderStoreGames(filtered);
            }
        });
        // --- GESTIONE BARRA DI RICERCA IN TEMPO REALE ---
    const searchBar = document.getElementById('search-bar');
    if (searchBar) {
        searchBar.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase().trim();

            // Filtra i giochi dello store in base a ciò che scrivi nel titolo
            const filtered = currentStoreGames.filter(game => 
                game.title.toLowerCase().includes(searchTerm)
            );

            renderStoreGames(filtered);
        });
    }
    });

    // --- COMMUNITY HUB (FETCH BACKEND) ---
    const postSubmitBtn = document.getElementById('post-submit-btn');
    const communityPostInput = document.getElementById('community-post-input');
    const communityFeed = document.getElementById('community-feed');

    async function renderCommunityPosts() {
        if (!communityFeed) return;
        try {
            const res = await fetch('/api/posts');
            const posts = await res.json();

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
        } catch (err) {
            console.error("Errore nel caricamento post:", err);
        }
    }

    if (postSubmitBtn) {
        postSubmitBtn.addEventListener('click', async () => {
            const text = communityPostInput.value.trim();
            if (!text) return alert("Scrivi qualcosa prima di pubblicare!");

            try {
                const res = await fetch('/api/posts', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ author: loggedUser || "Gamer", text: text })
                });

                if (res.ok) {
                    communityPostInput.value = "";
                    renderCommunityPosts();
                }
            } catch (err) {
                alert("Errore nell'invio del post.");
            }
        });
    }

    // --- CUSTOMER SUPPORT (FETCH BACKEND) ---
    const supportForm = document.getElementById('support-form');
    const supportSuccessMsg = document.getElementById('support-success-msg');

    if (supportForm) {
        supportForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            const issueType = document.getElementById('support-issue').value;
            const message = document.getElementById('support-message').value;

            if (message.trim() !== "") {
                try {
                    const response = await fetch('/api/support', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            username: loggedUser || "Guest",
                            issueType: issueType,
                            message: message
                        })
                    });

                    const data = await response.json();

                    if (data.success) {
                        supportSuccessMsg.textContent = `Ticket (${data.ticketId}) submitted successfully! Our support team will review your "${issueType}" request shortly.`;
                        supportSuccessMsg.style.display = 'block';
                        supportSuccessMsg.style.color = '#66c0f4';
                        supportForm.reset();

                        setTimeout(() => {
                            supportSuccessMsg.style.display = 'none';
                        }, 5000);
                    }
                } catch (error) {
                    console.error("Error submitting support ticket:", error);
                    supportSuccessMsg.textContent = 'Error sending ticket to server. Please try again.';
                    supportSuccessMsg.style.color = '#ff4d4d';
                    supportSuccessMsg.style.display = 'block';
                }
            }
        });
    }

});