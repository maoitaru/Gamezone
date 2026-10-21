document.addEventListener('DOMContentLoaded', function() {
    
    // --- PARTE 1: GESTIONE LOGIN ---
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        const usernameInput = document.getElementById('username');
        const passwordInput = document.getElementById('password');
        const errorMessage = document.getElementById('error-message');

loginForm.addEventListener('submit', function(event) {
            // Blocchiamo il comportamento standard del form
            event.preventDefault();

            const enteredUser = usernameInput.value.trim();
            const enteredPass = passwordInput.value.trim();

            // CONTROLLO RIGIDO: Username E Password devono essere corretti entrambi
            if (enteredUser === "maoitaru" && enteredPass === "26799") {
                // Se tutto è corretto, salviamo e andiamo alla home
                localStorage.setItem('gameZoneUser', enteredUser);
                window.location.href = 'index.html';
            } else {
                // Se qualcosa è sbagliato, mostriamo un messaggio di errore chiaro sulla pagina
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
            // Se non c'è sessione attiva, rimanda al login
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
    // --- PARTE 4: GESTIONE NAVIGAZIONE STORE vs LIBRARY (Viste Dinamiche) ---
    const storeLink = document.querySelector('nav a[href="#store"]');
    const libraryLink = document.querySelector('nav a[href="#library"]');
    const storeView = document.getElementById('store-view');
    const libraryView = document.getElementById('library-view');

    if (storeLink && libraryLink && storeView && libraryView) {
        storeLink.addEventListener('click', function(e) {
            e.preventDefault();
            storeView.style.display = 'block';
            libraryView.style.display = 'none';
        });

        libraryLink.addEventListener('click', function(e) {
            e.preventDefault();
            storeView.style.display = 'none';
            libraryView.style.display = 'block';
            renderLibrary(); // Aggiorna la libreria quando ci entri
        });
    }

    // --- PARTE 5: GENERATORE RANDOM DI GIOCHI & ACQUISTI ---
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

    // Funzioni per la gestione della libreria nel localStorage
    function getMyLibrary() {
        const savedLibrary = localStorage.getItem('gameZoneLibrary');
        return savedLibrary ? JSON.parse(savedLibrary) : [];
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
                <button type="button" style="background-color: #2a475e; border: 1px solid #66c0f4; color: #66c0f4; cursor: pointer; padding: 8px; border-radius: 4px; font-weight: bold;">Play Game</button>
            `;
            libraryContainer.appendChild(card);
        });
    }

    // Generatore dei giochi nello Store
    function generateRandomGames(count = 8) {
        if (!dynamicGameList) return;
        
        dynamicGameList.innerHTML = "";

        for (let i = 0; i < count; i++) {
            const title = `${getRandomElement(prefixes)} ${getRandomElement(nouns)} ${Math.floor(Math.random() * 3) + 1}`;
            const genre = getRandomElement(genres);
            const price = getRandomPrice();
            const image = getRandomElement(gameImages);

            const gameCard = document.createElement('article');
            gameCard.className = 'game-card';
            gameCard.innerHTML = `
                <div class="game-thumbnail" style="background: url('${image}') center/cover; height: 140px; border-radius: 4px;"></div>
                <h4 style="margin-top: 10px;">${title}</h4>
                <p style="font-size: 0.8rem; color: #8f98a0; margin: 2px 0;">Genre: ${genre}</p>
                <span class="price">${price}</span>
                <button type="button" class="buy-btn" style="padding: 8px; background-color: #5c7e10; border: none; border-radius: 4px; color: white; font-weight: bold; cursor: pointer;">Buy Now</button>
            `;

            // Mettiamo in ascolto il bottone "Buy Now" di questo singolo gioco
            const buyButton = gameCard.querySelector('.buy-btn');
            buyButton.addEventListener('click', function() {
                addToLibrary({ title, image, price });
            });

            dynamicGameList.appendChild(gameCard);
        }
    }

    // Gestione del tasto "Add to Cart" del banner in evidenza
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

    // Avvio iniziale
    if (dynamicGameList) {
        generateRandomGames(8);
    }

    if (generateBtn) {
        generateBtn.addEventListener('click', function() {
            generateRandomGames(8);
        });
    }
});