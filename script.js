document.addEventListener('DOMContentLoaded', function() {

    let currentTopicFilter = 'All';
    let currentStoreGames = [];

    // --- SISTEMA NOTIFICHE TOAST ---
    function showToast(message, icon = "🎮") {
        let existingToast = document.getElementById('toast-notification');
        if (existingToast) existingToast.remove();

        const toast = document.createElement('div');
        toast.id = 'toast-notification';
        toast.innerHTML = `<span class="toast-icon">${icon}</span> <span>${message}</span>`;
        document.body.appendChild(toast);

        setTimeout(() => toast.classList.add('show'), 10);

        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 4000);
    }

    // --- PART 1: LOGIN, REMEMBER ME & FORGOT PASSWORD MANAGEMENT ---
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        const usernameInput = document.getElementById('username');
        const passwordInput = document.getElementById('password');
        const rememberCheckbox = document.querySelector('input[name="remember"]');
        const errorMessage = document.getElementById('error-message');
        const forgotLink = document.querySelector('.forgot-link');

        // Modal Elements
        const forgotModal = document.getElementById('forgot-modal');
        const resetUsernameInput = document.getElementById('reset-username');
        const resetNewPasswordInput = document.getElementById('reset-new-password');
        const submitResetBtn = document.getElementById('submit-reset-btn');
        const closeResetBtn = document.getElementById('close-reset-btn');

        // 1. Auto-fill username and password if remembered
        const rememberedUser = localStorage.getItem('gameZoneRememberedUser');
        const rememberedPass = localStorage.getItem('gameZoneRememberedPass');
        if (rememberedUser && usernameInput) {
            usernameInput.value = rememberedUser;
            if (rememberedPass && passwordInput) passwordInput.value = rememberedPass;
            if (rememberCheckbox) rememberCheckbox.checked = true;
        }

        // 2. Login submit with Remember Me handling
        loginForm.addEventListener('submit', async function(event) {
            event.preventDefault();
            const username = usernameInput.value.trim();
            const password = passwordInput.value.trim();

            if (rememberCheckbox && rememberCheckbox.checked) {
                localStorage.setItem('gameZoneRememberedUser', username);
                localStorage.setItem('gameZoneRememberedPass', password);
            } else {
                localStorage.removeItem('gameZoneRememberedUser');
                localStorage.removeItem('gameZoneRememberedPass');
            }

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
                    errorMessage.textContent = data.message || 'Incorrect credentials!';
                    errorMessage.style.color = '#ff4d4d';

                    if (passwordInput) passwordInput.value = "";

                    if (data.locked && forgotModal) {
                        showToast("Account locked! Please reset your password.", "🔒");
                        setTimeout(() => {
                            forgotModal.style.display = 'flex';
                            if (resetUsernameInput) resetUsernameInput.value = username;
                        }, 1500);
                    }
                }
            } catch (err) {
                errorMessage.textContent = 'Server connection error!';
                errorMessage.style.color = '#ff4d4d';
                if (passwordInput) passwordInput.value = "";
            }
        });

        if (forgotLink && forgotModal) {
            forgotLink.addEventListener('click', function(e) {
                e.preventDefault();
                forgotModal.style.display = 'flex';
            });
        }

        if (closeResetBtn && forgotModal) {
            closeResetBtn.addEventListener('click', function() {
                forgotModal.style.display = 'none';
            });
        }

        if (submitResetBtn) {
            submitResetBtn.addEventListener('click', async function() {
                const username = resetUsernameInput.value.trim();
                const newPassword = resetNewPasswordInput.value.trim();

                if (!username || !newPassword) {
                    showToast("Please fill in all fields!", "❌");
                    return;
                }

                try {
                    const response = await fetch('/api/forgot-password', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ username, newPassword })
                    });

                    const data = await response.json();
                    if (data.success) {
                        showToast("Password updated successfully!", "🔑");
                        forgotModal.style.display = 'none';
                        resetUsernameInput.value = "";
                        resetNewPasswordInput.value = "";

                        if (passwordInput) passwordInput.value = "";
                        if (errorMessage) errorMessage.textContent = "";

                    } else {
                        showToast(data.message || "Error resetting password.", "❌");
                    }
                } catch (err) {
                    showToast("Server connection error!", "❌");
                }
            });
        }
        if (resetNewPasswordInput && submitResetBtn) {
            resetNewPasswordInput.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    submitResetBtn.click();
                }
            });
        }
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
                    showToast('Registration successful! You can now sign in.', '🎉');
                    setTimeout(() => {
                        window.location.href = 'login.html';
                    }, 800); // 1.5 secondi per leggere la notifica
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

// --- PARTE 2: CONTROLLO ACCESSO HOME & MENU PROFILO ---
    const welcomeUserSpan = document.getElementById('welcome-user');
    const loggedUser = localStorage.getItem('gameZoneUser');

    if (welcomeUserSpan) {
        if (loggedUser) {
            welcomeUserSpan.textContent = `Logged in as: ${loggedUser}`;
        } else {
            window.location.href = 'login.html';
        }
    }

    // Gestione Menu a tendina Profilo (Header)
const profileIconBtn = document.getElementById('profile-icon-btn');
    const profileDropdown = document.getElementById('profile-dropdown');
    const goToAdminBtn = document.getElementById('go-to-admin-btn');

    if (profileIconBtn && profileDropdown) {
        profileIconBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            profileDropdown.classList.toggle('show');
        });

        document.addEventListener('click', () => {
            profileDropdown.classList.remove('show');
        });
    }

    if (goToAdminBtn) {
        if (loggedUser === 'admin') {
            goToAdminBtn.style.display = 'block';
        } else {
            goToAdminBtn.style.display = 'none';
        }
    }

// Mostra la voce "Admin Dashboard" a tutti gli utenti loggati
    if (goToAdminBtn) {
        goToAdminBtn.style.display = 'block';
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
                    <div class="game-thumbnail clickable-thumbnail" style="background: url('${game.image}') center/cover; height: 140px; border-radius: 4px; cursor: pointer;" title="Click for details"></div>
                    <h4 class="clickable-title" style="margin-top: 10px; cursor: pointer;" title="Click for details">${game.title}</h4>
                    <span class="price" style="color: #66c0f4;">Owned</span>
                    <div style="display: flex; gap: 10px; margin-top: 5px;">
                        <button type="button" style="flex: 1; background-color: #2a475e; border: 1px solid #66c0f4; color: #66c0f4; cursor: pointer; padding: 8px; border-radius: 4px; font-weight: bold;">Play</button>
                        <button type="button" class="remove-btn" style="background-color: #3b1d1d; border: 1px solid #ff4d4d; color: #ff4d4d; cursor: pointer; padding: 8px 12px; border-radius: 4px; font-weight: bold;" title="Remove">🗑️</button>
                    </div>
                `;

                // --- RENDI CLICCABILE ANCHE DALLA LIBRERIA ---
                const openDetails = () => {
                    openGameDetailModal(game);
                };
                card.querySelector('.clickable-thumbnail').addEventListener('click', openDetails);
                card.querySelector('.clickable-title').addEventListener('click', openDetails);
                // ---------------------------------------------

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
            showToast(data.message, "🛒");
        } catch (err) {
            showToast("Error adding to library.");
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
    const profileView = document.getElementById('profile-view');
    const adminView = document.getElementById('admin-view');
    const supportView = document.getElementById('support-view');

    const goToProfileBtn = document.getElementById('go-to-profile-btn');
    const goToAdminBtnDropdown = document.getElementById('go-to-admin-btn');

function hideAllViews() {
        if (storeView) storeView.style.display = 'none';
        if (libraryView) libraryView.style.display = 'none';
        if (communityView) communityView.style.display = 'none';
        if (profileView) profileView.style.display = 'none';
        if (adminView) adminView.style.display = 'none'; // <-- Aggiunto qui!
        if (supportView) supportView.style.display = 'none';
    }

if (storeLink) storeLink.addEventListener('click', (e) => { e.preventDefault(); hideAllViews(); storeView.style.display = 'block'; });
    if (libraryLink) libraryLink.addEventListener('click', (e) => { e.preventDefault(); hideAllViews(); libraryView.style.display = 'block'; renderLibrary(); });
    if (communityLink) communityLink.addEventListener('click', (e) => { e.preventDefault(); hideAllViews(); communityView.style.display = 'block'; renderCommunityPosts(); });
    if (supportLink) supportLink.addEventListener('click', (e) => { e.preventDefault(); hideAllViews(); supportView.style.display = 'block'; });

    if (goToProfileBtn) {
        goToProfileBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            hideAllViews();
            if (profileView) profileView.style.display = 'block';

            document.getElementById('profile-username').textContent = loggedUser || "Guest";

            let gamesCount = 0;
            let postsCount = 0;

            try {
                const libRes = await fetch(`/api/library/${loggedUser}`);
                const library = await libRes.json();
                gamesCount = library.length;
                document.getElementById('profile-games-count').textContent = gamesCount;
            } catch (err) {
                console.error("Errore caricamento giochi profilo:", err);
            }

            try {
                const postRes = await fetch('/api/posts');
                const posts = await postRes.json();
                const userPosts = posts.filter(p => p.author === loggedUser);
                postsCount = userPosts.length;
                document.getElementById('profile-posts-count').textContent = postsCount;
            } catch (err) {
                console.error("Errore caricamento post profilo:", err);
            }

            // Calcolo dinamico livello ed XP basato su giochi e post
            const totalXp = (gamesCount * 100) + (postsCount * 50) + 150; // Bonus base
            const level = Math.floor(totalXp / 300) + 1;
            const currentXpInLevel = totalXp % 300;

            document.getElementById('profile-level').textContent = level;
            document.getElementById('profile-xp-text').textContent = `${currentXpInLevel} / 300 XP`;
            const xpPercentage = (currentXpInLevel / 300) * 100;
            document.getElementById('profile-xp-bar').style.width = `${xpPercentage}%`;
        });
    }

// --- FUNZIONE PER CARICARE E GESTIRE I TICKET ADMIN ---
    async function loadAdminTickets() {
        const ticketsContainer = document.getElementById('admin-tickets-container');
        if (!ticketsContainer) return;
        ticketsContainer.innerHTML = `<p class="admin-loading-text">Loading support tickets...</p>`;

        try {
            const res = await fetch('/api/support/tickets');
            const tickets = await res.json();

            ticketsContainer.innerHTML = "";

            if (tickets.length === 0) {
                ticketsContainer.innerHTML = `<p style="color: #8f98a0;">No support tickets found. Everything is running smoothly!</p>`;
                return;
            }

            const table = document.createElement('table');
            table.style.cssText = "width: 100%; border-collapse: collapse; color: #c7d5e0; font-size: 0.9rem;";
            
            table.innerHTML = `
                <thead>
                    <tr style="border-bottom: 1px solid #2a475e; text-align: left; color: #66c0f4;">
                        <th style="padding: 10px;">ID</th>
                        <th style="padding: 10px;">User</th>
                        <th style="padding: 10px;">Issue Type</th>
                        <th style="padding: 10px;">Message</th>
                        <th style="padding: 10px;">Status</th>
                        <th style="padding: 10px; text-align: center;">Actions</th>
                    </tr>
                </thead>
                <tbody id="tickets-table-body"></tbody>
            `;

            const tbody = table.querySelector('#tickets-table-body');

            tickets.forEach(ticket => {
                const currentStatus = ticket.status || 'Pending';
                
                const tr = document.createElement('tr');
                tr.style.borderBottom = "1px solid #1b2838";
                tr.innerHTML = `
                    <td style="padding: 10px; color: #8f98a0; font-family: monospace;">${ticket.ticketId || ticket.id || 'N/A'}</td>
                    <td style="padding: 10px; color: #66c0f4; font-weight: bold;">${ticket.username}</td>
                    <td style="padding: 10px;">${ticket.issueType}</td>
                    <td style="padding: 10px; color: #c7d5e0; max-width: 200px; word-break: break-word;">${ticket.message}</td>
                    <td style="padding: 10px;">
                        <select class="status-select" data-id="${ticket.ticketId}" style="background-color: #10141b; color: #c7d5e0; border: 1px solid #2a475e; padding: 4px 8px; border-radius: 4px; font-weight: bold;">
                            <option value="Pending" ${currentStatus === 'Pending' ? 'selected' : ''}>⏳ Pending</option>
                            <option value="In Progress" ${currentStatus === 'In Progress' ? 'selected' : ''}>🛠️ In Progress</option>
                            <option value="Resolved" ${currentStatus === 'Resolved' ? 'selected' : ''}>✅ Resolved</option>
                        </select>
                    </td>
                    <td style="padding: 10px; text-align: center;">
                        <button type="button" class="delete-ticket-btn" data-id="${ticket.ticketId}" style="background-color: #3b1d1d; border: 1px solid #ff4d4d; color: #ff4d4d; padding: 6px 10px; border-radius: 4px; cursor: pointer; font-weight: bold;" title="Delete Ticket">🗑️</button>
                    </td>
                `;

                // Gestore cambio stato
                tr.querySelector('.status-select').addEventListener('change', async (e) => {
                    const newStatus = e.target.value;
                    try {
                        const statusRes = await fetch('/api/support/status', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ ticketId: ticket.ticketId, newStatus })
                        });
                        const statusData = await statusRes.json();

                        if (statusData.success) {
                            showToast(`Ticket status updated to "${newStatus}"!`, "🔄");
                        } else {
                            showToast("Error updating status.", "❌");
                        }
                    } catch (err) {
                        showToast("Server connection error!", "❌");
                    }
                });

                // Gestore evento eliminazione
                tr.querySelector('.delete-ticket-btn').addEventListener('click', async () => {
                    if (confirm(`Are you sure you want to delete ticket ${ticket.ticketId}?`)) {
                        try {
                            const deleteRes = await fetch('/api/support/delete', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ ticketId: ticket.ticketId })
                            });
                            const deleteData = await deleteRes.json();

                            if (deleteData.success) {
                                showToast("Ticket deleted successfully!", "🗑️");
                                loadAdminTickets();
                            } else {
                                showToast(deleteData.message || "Error deleting ticket.", "❌");
                            }
                        } catch (err) {
                            showToast("Server connection error!", "❌");
                        }
                    }
                });

                tbody.appendChild(tr);
            });

            ticketsContainer.appendChild(table);

        } catch (err) {
            console.error("Errore caricamento ticket:", err);
            ticketsContainer.innerHTML = `<p style="color: #ff4d4d;">Error loading support tickets from server.</p>`;
        }
    }

    // --- GESTIONE MODALE ACCESSO ADMIN ---
    const adminLoginModal = document.getElementById('admin-login-modal');
    const submitAdminLoginBtn = document.getElementById('submit-admin-login');
    const cancelAdminLoginBtn = document.getElementById('cancel-admin-login');
    const adminPasswordInput = document.getElementById('admin-password-input');
    const adminLoginError = document.getElementById('admin-login-error');

    // --- INVIO CON IL TASTO ENTER PER ADMIN LOGIN ---
    if (adminPasswordInput && submitAdminLoginBtn) {
        adminPasswordInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                submitAdminLoginBtn.click(); // Simula il click sul pulsante Access
            }
        });
    }

    if (goToAdminBtnDropdown) {
        goToAdminBtnDropdown.addEventListener('click', (e) => {
            e.preventDefault();
            if (adminLoginModal) {
                adminLoginModal.style.display = 'flex';
                adminPasswordInput.value = "";
                adminLoginError.style.display = 'none';
            }
        });
    }

    if (cancelAdminLoginBtn && adminLoginModal) {
        cancelAdminLoginBtn.addEventListener('click', () => {
            adminLoginModal.style.display = 'none';
        });
    }

    if (submitAdminLoginBtn) {
        submitAdminLoginBtn.addEventListener('click', async () => {
            const password = adminPasswordInput.value.trim();
            if (!password) {
                adminLoginError.textContent = "Please enter the password.";
                adminLoginError.style.display = 'block';
                return;
            }

            try {
                const res = await fetch('/api/admin/verify', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ password })
                });
                const data = await res.json();

                if (data.success) {
                    adminLoginModal.style.display = 'none';
                    showToast("Admin access granted!", "🔐");
                    
                    hideAllViews();
                    if (adminView) adminView.style.display = 'block';
                    
                    // Chiama la funzione per caricare i ticket
                    loadAdminTickets();
                } else {
                    adminLoginError.textContent = data.message;
                    adminLoginError.style.display = 'block';
                }
            } catch (err) {
                showToast("Server connection error!", "❌");
            }
        });
    }

    // --- GESTIONE VISTA PROFILO DAL MENU A TENDINA ---
    if (goToProfileBtn) {
        goToProfileBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            hideAllViews();
            if (profileView) profileView.style.display = 'block';

            document.getElementById('profile-username').textContent = loggedUser || "Guest";

            try {
                const libRes = await fetch(`/api/library/${loggedUser}`);
                const library = await libRes.json();
                document.getElementById('profile-games-count').textContent = library.length;
            } catch (err) {
                console.error("Errore caricamento giochi profilo:", err);
            }

            try {
                const postRes = await fetch('/api/posts');
                const posts = await postRes.json();
                const userPosts = posts.filter(p => p.author === loggedUser);
                document.getElementById('profile-posts-count').textContent = userPosts.length;
            } catch (err) {
                console.error("Errore caricamento post profilo:", err);
            }
        });
    }

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
                <div class="game-thumbnail clickable-thumbnail" style="background: url('${game.image}') center/cover; height: 140px; border-radius: 4px; cursor: pointer;" title="Click for details"></div>
                <h4 class="clickable-title" style="margin-top: 10px; cursor: pointer;" title="Click for details">${game.title}</h4>
                <p style="font-size: 0.8rem; color: #8f98a0; margin: 2px 0;">Genre: ${game.genre}</p>
                <span class="price">${game.price}</span>
                <button type="button" class="buy-btn" style="padding: 8px; background-color: #5c7e10; border: none; border-radius: 4px; color: white; font-weight: bold; cursor: pointer;">Buy Now</button>
            `;

            // --- AGGIUNGI QUESTO BLOCCO PER APRIRE LA MODALE ---
            const openDetails = () => {
                openGameDetailModal(game);
            };

            card.querySelector('.clickable-thumbnail').addEventListener('click', openDetails);
            card.querySelector('.clickable-title').addEventListener('click', openDetails);
            // --------------------------------------------------

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

    // --- GESTIONE FILTRO GENERI CON SELECT A TENDINA ---
    const genreSelect = document.getElementById('genre-select');
    if (genreSelect) {
        genreSelect.addEventListener('change', (e) => {
            const selectedGenre = e.target.value;

            if (selectedGenre === 'All' || selectedGenre === 'all') {
                renderStoreGames(currentStoreGames);
            } else {
                const filtered = currentStoreGames.filter(g => g.genre === selectedGenre);
                renderStoreGames(filtered);
            }
        });
    }

    // --- GESTIONE BARRA DI RICERCA IN TEMPO REALE ---
    const searchBar = document.getElementById('search-bar');
    if (searchBar) {
        searchBar.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase().trim();
            const filtered = currentStoreGames.filter(game => 
                game.title.toLowerCase().includes(searchTerm)
            );
            renderStoreGames(filtered);
        });
    }

    // --- GESTIONE FILTRI TOPIC COMMUNITY ---
    document.querySelectorAll('.topic-filter-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.topic-filter-btn').forEach(b => {
                b.style.backgroundColor = '#171a21';
                b.style.color = '#c7d5e0';
                b.style.border = '1px solid #2a475e';
            });
            e.target.style.backgroundColor = '#2a475e';
            e.target.style.color = '#66c0f4';
            e.target.style.border = '1px solid #66c0f4';

            currentTopicFilter = e.target.getAttribute('data-topic');
            renderCommunityPosts();
        });
    });

    // --- COMMUNITY HUB (RENDER POSTS & COMMENTS WITH EMOJIS & TOPICS) ---
    async function renderCommunityPosts() {
        if (!communityFeed) return;
        try {
            const res = await fetch('/api/posts');
            let posts = await res.json();

            // --- FILTRO TOPIC ATTIVO ---
            if (currentTopicFilter !== 'All') {
                posts = posts.filter(p => (p.topic || 'General') === currentTopicFilter);
            }

            communityFeed.innerHTML = "";

            if (posts.length === 0) {
                communityFeed.innerHTML = `<p style="color: #8f98a0; padding: 20px;">No posts yet. Be the first to publish something!</p>`;
                return;
            }

            posts.forEach(post => {
                const isAuthor = (loggedUser && post.author === loggedUser);
                const comments = post.comments || [];
                
                const postCard = document.createElement('div');
                postCard.className = 'post-card';
                
                const commentsHTML = comments.map(c => `
                    <div class="comment-item">
                        <strong class="comment-author">${c.author}</strong>
                        <span class="comment-date">${c.date}</span>
                        <p class="comment-text">${c.text}</p>
                    </div>
                `).join('');

                postCard.innerHTML = `
                    <div class="post-header">
                        <div>
                            <span class="post-topic-badge" style="background-color: #2a475e; color: #66c0f4; padding: 2px 8px; border-radius: 3px; font-size: 0.75rem; font-weight: bold; margin-right: 8px;">${post.topic || 'General'}</span>
                            <strong class="post-author">${post.author}</strong>
                            <span class="post-date">${post.date}</span>
                        </div>
                        ${isAuthor ? `<button class="delete-post-btn" title="Delete Post">🗑️</button>` : ''}
                    </div>
                    <p class="post-text">${post.text}</p>
                    <div class="post-actions">
                        <button class="like-btn">
                            👍 Like (<span class="like-count">${post.likes || 0}</span>)
                        </button>
                    </div>

                    <!-- SEZIONE COMMENTI CON EMOJI -->
                    <div class="comments-section">
                        <div class="comments-list">
                            ${commentsHTML}
                        </div>
                        <div class="add-comment-box" style="position: relative;">
                            <input type="text" class="comment-input" placeholder="Write a comment..." />
                            
                            <!-- PULSANTE ED EMOJI POPUP -->
                            <div class="emoji-picker-container">
                                <button type="button" class="emoji-toggle-btn" title="Add Emoji">😊</button>
                                <div class="emoji-popup">
                                    <button type="button" class="emoji-item">🎮</button>
                                    <button type="button" class="emoji-item">🔥</button>
                                    <button type="button" class="emoji-item">🏆</button>
                                    <button type="button" class="emoji-item">🚀</button>
                                    <button type="button" class="emoji-item">👍</button>
                                    <button type="button" class="emoji-item">😎</button>
                                    <button type="button" class="emoji-item">👾</button>
                                    <button type="button" class="emoji-item">⭐</button>
                                    <button type="button" class="emoji-item">💯</button>
                                    <button type="button" class="emoji-item">💀</button>
                                </div>
                            </div>

                            <button class="submit-comment-btn">Comment</button>
                        </div>
                    </div>
                `;

// Verifica se l'utente attuale ha già messo like a questo post
                const userHasLiked = post.likedBy && post.likedBy.includes(loggedUser);
                const likeBtn = postCard.querySelector('.like-btn');
                
                if (userHasLiked) {
                    likeBtn.style.backgroundColor = '#66c0f4';
                    likeBtn.style.color = '#10141b';
                }

                // Gestore Like (Unico con Toggle)
                likeBtn.addEventListener('click', async () => {
                    if (!loggedUser) return showToast("You must be logged in to like posts!", "❌");

                    const response = await fetch('/api/posts/like', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ postId: post.id, username: loggedUser })
                    });
                    const data = await response.json();
                    
                    if (data.success) {
                        postCard.querySelector('.like-count').textContent = data.likes;
                        
                        // Aggiorna lo stile del bottone in tempo reale
                        if (data.hasLiked) {
                            likeBtn.style.backgroundColor = '#66c0f4';
                            likeBtn.style.color = '#10141b';
                            showToast("Like added!", "👍");
                        } else {
                            likeBtn.style.backgroundColor = '#2a475e';
                            likeBtn.style.color = '#66c0f4';
                            showToast("Like removed.", "👍");
                        }
                    }
                });

                // --- GESTORE EMOJI POPUP PER I COMMENTI ---
                const emojiBtn = postCard.querySelector('.emoji-toggle-btn');
                const emojiPopup = postCard.querySelector('.emoji-popup');
                const commentInput = postCard.querySelector('.comment-input');

                emojiBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    document.querySelectorAll('.emoji-popup').forEach(p => {
                        if (p !== emojiPopup) p.classList.remove('active');
                    });
                    emojiPopup.classList.toggle('active');
                });

                emojiPopup.querySelectorAll('.emoji-item').forEach(item => {
                    item.addEventListener('click', () => {
                        commentInput.value += item.textContent;
                        emojiPopup.classList.remove('active');
                        commentInput.focus();
                    });
                });

                // Gestore Invia Commento
                const submitCommentBtn = postCard.querySelector('.submit-comment-btn');
                submitCommentBtn.addEventListener('click', async () => {
                    const commentText = commentInput.value.trim();
                    if (!commentText) return showToast("Write a comment first!", "❌");

                    try {
                        const response = await fetch('/api/posts/comment', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                postId: post.id,
                                author: loggedUser || "Gamer",
                                text: commentText
                            })
                        });

                        const data = await response.json();
                        if (data.success) {
                            commentInput.value = "";
                            showToast("Comment added!", "💬");
                            renderCommunityPosts();
                        }
                    } catch (err) {
                        showToast("Error adding comment.", "❌");
                    }
                });

                // Gestore Elimina Post
                const deleteBtn = postCard.querySelector('.delete-post-btn');
                if (deleteBtn) {
                    deleteBtn.addEventListener('click', async () => {
                        if (confirm("Are you sure you want to delete this post?")) {
                            const response = await fetch('/api/posts/delete', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ postId: post.id, username: loggedUser })
                            });
                            const data = await response.json();
                            if (data.success) {
                                renderCommunityPosts();
                            } else {
                                showToast(data.message);
                            }
                        }
                    });
                }

                communityFeed.appendChild(postCard);
            });
        } catch (err) {
            console.error("Error loading posts:", err);
        }
    }

// --- INVIO NUOVO POST (CON TOPIC) ---
    const postSubmitBtn = document.getElementById('post-submit-btn');
    const communityPostInput = document.getElementById('community-post-input');
    const communityFeed = document.getElementById('community-feed');

    if (postSubmitBtn) {
        postSubmitBtn.addEventListener('click', async () => {
            const text = communityPostInput.value.trim();
            const topicSelect = document.getElementById('post-topic-select');
            const topic = topicSelect ? topicSelect.value : "General";

            if (!text) return showToast("Write something before posting!");

            try {
                const res = await fetch('/api/posts', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                        author: loggedUser || "Gamer", 
                        text: text,
                        topic: topic 
                    })
                });

                if (res.ok) {
                    communityPostInput.value = "";
                    showToast("Post published successfully!", "💬");
                    renderCommunityPosts();
                }
            } catch (err) {
                showToast("Error sending post.");
            }
        });
    }

    // --- INCOLLA QUI IL GESTORE EMOJI PER IL BOX DI CREAZIONE POST ---
    const postEmojiBtn = document.getElementById('post-emoji-toggle-btn');
    const postEmojiPopup = document.getElementById('post-emoji-popup');

    if (postEmojiBtn && postEmojiPopup && communityPostInput) {
        postEmojiBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            document.querySelectorAll('.emoji-popup').forEach(p => {
                if (p !== postEmojiPopup) p.classList.remove('active');
            });
            postEmojiPopup.classList.toggle('active');
        });

        postEmojiPopup.querySelectorAll('.emoji-item').forEach(item => {
            item.addEventListener('click', () => {
                communityPostInput.value += item.textContent;
                postEmojiPopup.classList.remove('active');
                communityPostInput.focus();
            });
        });
    }

    // --- CUSTOMER SUPPORT (FETCH BACKEND) ---
    const supportForm = document.getElementById('support-form');

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
                        showToast(`Ticket (${data.ticketId}) submitted successfully!`, "🛠️");
                        supportForm.reset();
                    }
                } catch (error) {
                    console.error("Error submitting support ticket:", error);
                    showToast("Error sending ticket to server.");
                }
            }
        });
    }

    // --- CHIUSURA POPUP EMOJI CLICCANDO FUORI ---
    document.addEventListener('click', () => {
        document.querySelectorAll('.emoji-popup').forEach(p => {
            p.classList.remove('active');
        });
    });

// --- GESTIONE MODALE DETTAGLIO GIOCO ---
    const gameDetailModal = document.getElementById('game-detail-modal');
    const closeGameModalBtn = document.getElementById('close-game-modal');
    const modalGameTitle = document.getElementById('modal-game-title');
    const modalGameThumbnail = document.getElementById('modal-game-thumbnail');
    const modalGameGenre = document.getElementById('modal-game-genre');
    const modalGameDesc = document.getElementById('modal-game-desc');
    const modalGamePrice = document.getElementById('modal-game-price');
    const modalBuyBtn = document.getElementById('modal-buy-btn');
    const modalReviewsList = document.getElementById('modal-reviews-list');
    const modalReviewInput = document.getElementById('modal-review-input');
    const modalSubmitReview = document.getElementById('modal-submit-review');

    let currentGameInModal = null;
    let gameReviewsStorage = {};

    function openGameDetailModal(game) {
        currentGameInModal = game;
        if (!gameDetailModal) return;

        modalGameTitle.textContent = game.title;
        modalGameThumbnail.style.backgroundImage = `url('${game.image}')`;
        modalGameGenre.textContent = `Genre: ${game.genre}`;
        modalGameDesc.textContent = `Explore the immersive universe of ${game.title}. Featuring stunning graphics, epic sound design, and endless hours of ${game.genre.toLowerCase()} gameplay tailored for true gamers.`;
        modalGamePrice.textContent = game.price;

        renderModalReviews(game.title);

        gameDetailModal.style.display = 'flex';
    }

    if (closeGameModalBtn && gameDetailModal) {
        closeGameModalBtn.addEventListener('click', () => {
            gameDetailModal.style.display = 'none';
        });
    }

    if (modalBuyBtn) {
        modalBuyBtn.addEventListener('click', () => {
            if (currentGameInModal) {
                addToLibrary(currentGameInModal);
                gameDetailModal.style.display = 'none';
            }
        });
    }

    function renderModalReviews(gameTitle) {
        if (!modalReviewsList) return;
        modalReviewsList.innerHTML = "";

        if (!gameReviewsStorage[gameTitle]) {
            gameReviewsStorage[gameTitle] = [
                { author: "ProGamer99", text: "Amazing gameplay, totally worth it! 🔥" },
                { author: "SteamFan", text: "Graphics are insane. Highly recommended." }
            ];
        }

        const reviews = gameReviewsStorage[gameTitle];
        reviews.forEach(rev => {
            const div = document.createElement('div');
            div.className = 'game-modal-review-item';
            div.innerHTML = `<strong>${rev.author}:</strong> <span>${rev.text}</span>`;
            modalReviewsList.appendChild(div);
        });
    }

    if (modalSubmitReview) {
        modalSubmitReview.addEventListener('click', () => {
            const text = modalReviewInput.value.trim();
            if (!text || !currentGameInModal) return;

            if (!gameReviewsStorage[currentGameInModal.title]) {
                gameReviewsStorage[currentGameInModal.title] = [];
            }

            gameReviewsStorage[currentGameInModal.title].push({
                author: loggedUser || "Gamer",
                text: text
            });

            modalReviewInput.value = "";
            renderModalReviews(currentGameInModal.title);
            showToast("Review submitted!", "💬");
        });
    }
// --- GESTIONE EMOJI NELLA MODALE DETTAGLIO GIOCO ---
    const modalEmojiBtn = document.getElementById('modal-emoji-toggle-btn');
    const modalEmojiPopup = document.getElementById('modal-emoji-popup');

    if (modalEmojiBtn && modalEmojiPopup && modalReviewInput) {
        modalEmojiBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            document.querySelectorAll('.emoji-popup').forEach(p => {
                if (p !== modalEmojiPopup) p.classList.remove('active');
            });
            modalEmojiPopup.classList.toggle('active');
        });

        modalEmojiPopup.querySelectorAll('.emoji-item').forEach(item => {
            item.addEventListener('click', () => {
                modalReviewInput.value += item.textContent;
                modalEmojiPopup.classList.remove('active');
                modalReviewInput.focus();
            });
        });
    }
    // --- BANNER VETRINA FISSO (3 TITOLI) ---
    const featuredGames = [
        {
            title: "Cyber Quest 2077",
            genre: "Action",
            price: "$59.99",
            image: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800",
            description: "Experience the ultimate futuristic open-world RPG with breathtaking next-gen graphics."
        },
        {
            title: "Galactic Odyssey V",
            genre: "Sci-Fi",
            price: "$49.99",
            image: "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=800",
            description: "Explore uncharted star systems and build your interstellar empire among the stars."
        },
        {
            title: "Shadow Valhalla",
            genre: "RPG",
            price: "$39.99",
            image: "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=800",
            description: "A dark mythological journey through legendary realms and fierce monster battles."
        }
    ];

    let currentFeaturedIndex = 0;
    const bannerCard = document.getElementById('featured-banner-card');
    const bannerBg = document.getElementById('featured-banner-bg');
    const bannerTitle = document.getElementById('featured-title');
    const bannerDesc = document.getElementById('featured-desc');
    const bannerPrice = document.getElementById('featured-price');
    const bannerAddBtn = document.getElementById('featured-add-btn');
    const sliderDots = document.querySelectorAll('.slider-dot');

    function updateFeaturedBanner(index) {
        const game = featuredGames[index];
        currentFeaturedIndex = index;

        if (bannerBg) bannerBg.style.backgroundImage = `url('${game.image}')`;
        if (bannerTitle) bannerTitle.textContent = game.title;
        if (bannerDesc) bannerDesc.textContent = game.description;
        if (bannerPrice) bannerPrice.textContent = game.price;

        sliderDots.forEach((dot, i) => {
            if (i === index) dot.classList.add('active');
            else dot.classList.remove('active');
        });
    }

    sliderDots.forEach((dot, index) => {
        dot.addEventListener('click', (e) => {
            e.stopPropagation();
            updateFeaturedBanner(index);
        });
    });

    if (bannerCard) {
        bannerCard.addEventListener('click', () => {
            const game = featuredGames[currentFeaturedIndex];
            openGameDetailModal(game);
        });
    }

    if (bannerAddBtn) {
        bannerAddBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const game = featuredGames[currentFeaturedIndex];
            addToLibrary(game);
        });
    }

    updateFeaturedBanner(0);
});