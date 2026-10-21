document.addEventListener('DOMContentLoaded', function() {
    
    // --- PARTE 1: GESTIONE LOGIN ---
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        const usernameInput = document.getElementById('username');
        const passwordInput = document.getElementById('password');
        const errorMessage = document.getElementById('error-message');

        loginForm.addEventListener('submit', function(event) {
            event.preventDefault();
            console.log("Form inviato con successo!"); // <-- Controlla se vedi questo in console

            const enteredUser = usernameInput.value.trim();
            const enteredPass = passwordInput.value.trim();

            console.log("Utente:", enteredUser, "Password length:", enteredPass.length);

            if (enteredUser !== "" && enteredPass.length >= 4) {
                localStorage.setItem('gameZoneUser', enteredUser);
                console.log("Dati salvati, tentiamo il redirect a index.html...");
                
                // Proviamo a forzare il reindirizzamento assoluto o relativo
                window.location.href = './index.html';
            } else {
                errorMessage.textContent = 'Accesso negato: inserisci un gamertag valido e una password di almeno 4 caratteri.';
                errorMessage.style.color = '#ff4d4d';
            }
        });
    }
    // ... resto del codice ...
});

    // --- PARTE 2: PROTEZIONE E PERSONALIZZAZIONE HOME (Attivo su index.html) ---
    const welcomeUserSpan = document.getElementById('welcome-user');
    if (welcomeUserSpan) {
        const loggedUser = localStorage.getItem('gameZoneUser');
        
        // Controllo di sicurezza: se l'utente NON è loggato, viene rispedito al login
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
            // Puliamo la memoria del browser
            localStorage.removeItem('gameZoneUser');
            // Torniamo alla pagina di login
            window.location.href = 'login.html';
        });
    }