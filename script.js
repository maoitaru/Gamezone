document.addEventListener('DOMContentLoaded', function() {

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

                    // SVUOTA LA PASSWORD DOPO OGNI TENTATIVO ERRATO
                    if (passwordInput) passwordInput.value = "";

                    // If account is locked due to too many failed attempts, automatically open the reset modal
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

        // 3. Open Forgot Password Modal
        if (forgotLink && forgotModal) {
            forgotLink.addEventListener('click', function(e) {
                e.preventDefault();
                forgotModal.style.display = 'flex';
            });
        }

        // Close Modal
        if (closeResetBtn && forgotModal) {
            closeResetBtn.addEventListener('click', function() {
                forgotModal.style.display = 'none';
            });
        }

        // Submit Reset Password from Modal
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

                        // SVUOTA IL CAMPO PASSWORD DEL FORM DI LOGIN PER INSERIRE QUELLA NUOVA
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
                    showToast('Registration successful! You can now sign in.');
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
            showToast(data.message, "🛒");
        } catch (err) {
            showToast("Error adding to library.");
        }
    }

    // --- NAVIGAZIONE VISTE ---
    const storeLink = document.querySelector('nav a[href="#store"]');
    const libraryLink = document.querySelector('nav a[href="#library"]');
    const communityLink = document.querySelector('nav a[href="#community"]');
    const profileLink = document.querySelector('nav a[href="#profile"]');
    const adminLink = document.querySelector('nav a[href="#admin"]');
    const supportLink = document.querySelector('nav a[href="#support"]');

    const storeView = document.getElementById('store-view');
    const libraryView = document.getElementById('library-view');
    const communityView = document.getElementById('community-view');
    const profileView = document.getElementById('profile-view');
    const adminView = document.getElementById('admin-view');
    const supportView = document.getElementById('support-view');

    function hideAllViews() {
        if (storeView) storeView.style.display = 'none';
        if (libraryView) libraryView.style.display = 'none';
        if (communityView) communityView.style.display = 'none';
        if (profileView) profileView.style.display = 'none';
        if (adminView) adminView.style.display = 'none';
        if (supportView) supportView.style.display = 'none';
    }

    if (storeLink) storeLink.addEventListener('click', (e) => { e.preventDefault(); hideAllViews(); storeView.style.display = 'block'; });
    if (libraryLink) libraryLink.addEventListener('click', (e) => { e.preventDefault(); hideAllViews(); libraryView.style.display = 'block'; renderLibrary(); });
    if (communityLink) communityLink.addEventListener('click', (e) => { e.preventDefault(); hideAllViews(); communityView.style.display = 'block'; renderCommunityPosts(); });
    if (profileLink) {
        profileLink.addEventListener('click', async (e) => {
            e.preventDefault();
            hideAllViews();
            profileView.style.display = 'block';

            // Aggiorna nome utente
            document.getElementById('profile-username').textContent = loggedUser || "Guest";

            // Conta i giochi in libreria dal backend
            try {
                const libRes = await fetch(`/api/library/${loggedUser}`);
                const library = await libRes.json();
                document.getElementById('profile-games-count').textContent = library.length;
            } catch (err) {
                console.error("Errore caricamento giochi profilo:", err);
            }

            // Conta i post della community scritti dall'utente
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
    if (adminLink) {
        adminLink.addEventListener('click', async (e) => {
            e.preventDefault();
            hideAllViews();
            adminView.style.display = 'block';

            const ticketsContainer = document.getElementById('admin-tickets-container');
            ticketsContainer.innerHTML = `<p style="color: #8f98a0;">Loading support tickets...</p>`;

            try {
                const res = await fetch('/api/support/tickets');
                const tickets = await res.json();

                ticketsContainer.innerHTML = "";

                if (tickets.length === 0) {
                    ticketsContainer.innerHTML = `<p style="color: #8f98a0;">No support tickets found. Everything is running smoothly!</p>`;
                    return;
                }

                // Creiamo una tabella per mostrare i ticket in modo ordinato
                const table = document.createElement('table');
                table.style.cssText = "width: 100%; border-collapse: collapse; color: #c7d5e0; font-size: 0.9rem;";
                
                table.innerHTML = `
                    <thead>
                        <tr style="border-bottom: 1px solid #2a475e; text-align: left; color: #66c0f4;">
                            <th style="padding: 10px;">ID</th>
                            <th style="padding: 10px;">User</th>
                            <th style="padding: 10px;">Issue Type</th>
                            <th style="padding: 10px;">Message</th>
                        </tr>
                    </thead>
                    <tbody id="tickets-table-body"></tbody>
                `;

                const tbody = table.querySelector('#tickets-table-body');

                tickets.forEach(ticket => {
                    const tr = document.createElement('tr');
                    tr.style.borderBottom = "1px solid #1b2838";
                    tr.innerHTML = `
                        <td style="padding: 10px; color: #8f98a0; font-family: monospace;">${ticket.id || 'N/A'}</td>
                        <td style="padding: 10px; color: #66c0f4; font-weight: bold;">${ticket.username}</td>
                        <td style="padding: 10px;">${ticket.issueType}</td>
                        <td style="padding: 10px; color: #c7d5e0; max-width: 300px; word-break: break-word;">${ticket.message}</td>
                    `;
                    tbody.appendChild(tr);
                });

                ticketsContainer.appendChild(table);

            } catch (err) {
                console.error("Errore caricamento ticket:", err);
                ticketsContainer.innerHTML = `<p style="color: #ff4d4d;">Error loading support tickets from server.</p>`;
            }
        });
    }
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

    // --- COMMUNITY HUB (FETCH BACKEND) ---
    const postSubmitBtn = document.getElementById('post-submit-btn');
    const communityPostInput = document.getElementById('community-post-input');
    const communityFeed = document.getElementById('community-feed');

// --- COMMUNITY HUB (RENDER POSTS & COMMENTS WITH EMOJIS) ---
    async function renderCommunityPosts() {
        if (!communityFeed) return;
        try {
            const res = await fetch('/api/posts');
            const posts = await res.json();

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

                // Gestore Like
                postCard.querySelector('.like-btn').addEventListener('click', async () => {
                    const response = await fetch('/api/posts/like', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ postId: post.id })
                    });
                    const data = await response.json();
                    if (data.success) {
                        postCard.querySelector('.like-count').textContent = data.likes;
                    }
                });

                // Gestore Emoji Popup
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

if (postSubmitBtn) {
        postSubmitBtn.addEventListener('click', async () => {
            const text = communityPostInput.value.trim();
            if (!text) return showToast("Write something before posting!");

            try {
                const res = await fetch('/api/posts', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ author: loggedUser || "Gamer", text: text })
                });

                if (res.ok) {
                    communityPostInput.value = "";
                    showToast("Post published successfully!", "💬"); // <-- AGGIUNGI QUESTO
                    renderCommunityPosts();
                }
            } catch (err) {
                showToast("Error sending post.");
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
                        showToast(`Ticket (${data.ticketId}) submitted successfully!`, "🛠️"); // <-- AGGIUNGI QUESTO
                        supportForm.reset();
                    }
                } catch (error) {
                    console.error("Error submitting support ticket:", error);
                    showToast("Error sending ticket to server.");
                }
            }
        });
    }

    document.addEventListener('click', () => {
        document.querySelectorAll('.emoji-popup').forEach(p => {
            p.classList.remove('active');
        });
    });

});