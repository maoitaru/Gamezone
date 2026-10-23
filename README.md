# ⚡ GameZone - Steam-Style Web SPA

**GameZone** è una Single Page Application (SPA) dinamica e responsive ispirata alla celebre piattaforma *Steam*. Il progetto è stato sviluppato in HTML5, CSS3 moderno e Vanilla JavaScript (ES6+), simulando un'esperienza di gaming hub completa.

---

## 🚀 Caratteristiche Principali

* 🔐 **Sistema di Autenticazione e Sessione**: Gestione dell'accesso utente e persistenza dello stato tramite `localStorage`.
* 🎮 **Store Dinamico**:
  * Generatore casuale di titoli di gioco, prezzi e copertine.
  * Barra di ricerca in tempo reale.
  * Filtri dinamici per genere (Action, RPG, Indie, Strategy, ecc.).
* 📚 **Libreria Personale (My Library)**:
  * Aggiunta di giochi acquistati.
  * Gestione dello stato di possesso e rimozione dei titoli.
  * Salvataggio permanente nel browser (`localStorage`).
* 💬 **Community Hub**: Bacheca interattiva per la creazione e la lettura dei post degli utenti.
* 🎧 **Customer Support**: Form dinamico per l'invio dei ticket di assistenza.

---

## 🛠️ Tecnologie Utilizzate

* **HTML5**: Struttura semantica della SPA.
* **CSS3**: Layout reattivo con Flexbox, CSS Grid ed estetica dark-theme in stile Steam.
* **JavaScript (Vanilla ES6)**: Manipolazione del DOM, eventi e Web Storage API.

---

## 📁 Struttura del Progetto

```text
GameZone/
├── index.html        # Vista principale della Web App (Store, Library, Community, Support)
├── login.html        # Pagina di autenticazione utente
├── style.css         # Fogli di stile e temi grafici
├── script.js         # Logica di business, SPA routing e gestione stato
└── README.md         # Documentazione del progetto