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
});