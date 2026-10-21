// Gestione della logica di login e personalizzazione della home
document.addEventListener('DOMContentLoaded', function() {
    
    // --- PARTE 1: Gestione del form di login (attivo su login.html) ---
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        const usernameInput = document.getElementById('username');
        const passwordInput = document.getElementById('password');
        const errorMessage = document.getElementById('error-message');

        loginForm.addEventListener('submit', function(event) {
            event.preventDefault();

            const enteredUser = usernameInput.value.trim();
            const enteredPass = passwordInput.value.trim();

            if (enteredUser !== "" && enteredPass.length >= 4) {
                // Salviamo il nome utente nel browser
                localStorage.setItem('gameZoneUser', enteredUser);
                // Reindirizziamo alla home
                window.location.href = 'index.html';
            } else {
                errorMessage.textContent = 'Invalid login! Password must be at least 4 characters.';
                errorMessage.style.color = 'red';
            }
        });
    }

    // --- PARTE 2: Gestione della Home (attivo su index.html) ---
    const welcomeUserSpan = document.getElementById('welcome-user');
    if (welcomeUserSpan) {
        const loggedUser = localStorage.getItem('gameZoneUser');
        
        // Se c'è un utente salvato, diamogli il benvenuto, altrimenti rimandiamolo al login
        if (loggedUser) {
            welcomeUserSpan.textContent = `Hello, ${loggedUser}`;
        } else {
            window.location.href = 'login.html';
        }
    }
});