const express = require('express');
const app = express();
const PORT = 3000;

// Middleware per permettere al server di leggere i dati in formato JSON
app.use(express.json());

// Rotta di prova (Home del server)
app.get('/', (req, res) => {
    res.send('🚀 Il server di GameZone è attivo e funzionante!');
});

// Avviamo il server sulla porta 3000
app.listen(PORT, () => {
    console.log(`Server in ascolto sulla porta http://localhost:${PORT}`);
});