const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3000;

const USERS_FILE = path.join(__dirname, 'users.json');
const POSTS_FILE = path.join(__dirname, 'posts.json');
const SUPPORT_FILE = path.join(__dirname, 'support.json');

app.use(express.json());
app.use(express.static(__dirname));

// --- FUNZIONI DI SUPPORTO PER FILE JSON ---
function getUsers() {
    if (!fs.existsSync(USERS_FILE)) fs.writeFileSync(USERS_FILE, '[]', 'utf8');
    return JSON.parse(fs.readFileSync(USERS_FILE, 'utf8') || '[]');
}

function saveUsers(users) {
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf8');
}

function getPosts() {
    if (!fs.existsSync(POSTS_FILE)) fs.writeFileSync(POSTS_FILE, '[]', 'utf8');
    return JSON.parse(fs.readFileSync(POSTS_FILE, 'utf8') || '[]');
}

function savePosts(posts) {
    fs.writeFileSync(POSTS_FILE, JSON.stringify(posts, null, 2), 'utf8');
}

function getSupportTickets() {
    if (!fs.existsSync(SUPPORT_FILE)) fs.writeFileSync(SUPPORT_FILE, '[]', 'utf8');
    return JSON.parse(fs.readFileSync(SUPPORT_FILE, 'utf8') || '[]');
}

function saveSupportTickets(tickets) {
    fs.writeFileSync(SUPPORT_FILE, JSON.stringify(tickets, null, 2), 'utf8');
}

// --- ROTTE PAGINE STATICHE ---
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'index.html')));
app.get('/login.html', (req, res) => res.sendFile(path.join(__dirname, 'login.html')));
app.get('/register.html', (req, res) => res.sendFile(path.join(__dirname, 'register.html')));

// --- REGISTRATION ---
app.post('/api/register', (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ success: false, message: 'Incomplete data!' });

    const users = getUsers();
    if (users.some(u => u.username.toLowerCase() === username.toLowerCase())) {
        return res.status(400).json({ success: false, message: 'Username already exists!' });
    }

    users.push({ username, password, failedAttempts: 0, library: [] });
    saveUsers(users);
    res.json({ success: true });
});

// --- LOGIN WITH 3 ATTEMPTS LOCK ---
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    const users = getUsers();
    const user = users.find(u => u.username === username);

    if (!user) {
        return res.status(401).json({ success: false, message: 'User not found!' });
    }

    if (user.password === password) {
        user.failedAttempts = 0; // Reset attempts on success
        saveUsers(users);
        return res.json({ success: true, username: user.username });
    } else {
        user.failedAttempts = (user.failedAttempts || 0) + 1;
        saveUsers(users);

        if (user.failedAttempts >= 3) {
            return res.status(401).json({ 
                success: false, 
                locked: true, 
                message: 'Too many failed attempts! Account locked. Please reset your password.' 
            });
        }

        return res.status(401).json({ 
            success: false, 
            message: `Incorrect credentials! Failed attempts: ${user.failedAttempts}/3` 
        });
    }
});

// --- API: FORGOT PASSWORD (RESET ATTEMPTS) ---
app.post('/api/forgot-password', (req, res) => {
    const { username, newPassword } = req.body;
    
    const usersFile = path.join(__dirname, 'users.json');
    if (!fs.existsSync(usersFile)) {
        return res.json({ success: false, message: 'User not found.' });
    }

    let users = JSON.parse(fs.readFileSync(usersFile, 'utf8'));
    const userIndex = users.findIndex(u => u.username === username);

    if (userIndex === -1) {
        return res.json({ success: false, message: 'Username does not exist!' });
    }

    users[userIndex].password = newPassword;
    users[userIndex].failedAttempts = 0; 
    fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));

    res.json({ success: true, message: 'Password updated successfully!' });
});

// --- API LIBRERIA GIOCHI ---
app.get('/api/library/:username', (req, res) => {
    const users = getUsers();
    const user = users.find(u => u.username === req.params.username);
    res.json(user ? (user.library || []) : []);
});

app.post('/api/library/add', (req, res) => {
    const { username, game } = req.body;
    const users = getUsers();
    const user = users.find(u => u.username === username);

    if (!user) return res.status(404).json({ success: false, message: 'Utente non trovato' });

    if (!user.library) user.library = [];
    const exists = user.library.some(g => g.title === game.title);

    if (exists) {
        return res.json({ success: false, message: 'You already own this game!' });
    }

    user.library.push(game);
    saveUsers(users);
    res.json({ success: true, message: `"${game.title}" added to your Library!` });
});

app.post('/api/library/remove', (req, res) => {
    const { username, gameTitle } = req.body;
    const users = getUsers();
    const user = users.find(u => u.username === username);

    if (user && user.library) {
        user.library = user.library.filter(g => g.title !== gameTitle);
        saveUsers(users);
    }
    res.json({ success: true });
});

// --- API COMMUNITY HUB AGGIORNATE ---
app.get('/api/posts', (req, res) => {
    res.json(getPosts());
});

app.post('/api/posts', (req, res) => {
    const { author, text } = req.body;
    if (!text || !text.trim()) return res.status(400).json({ success: false });

    const posts = getPosts();
    const newPost = {
        id: "post-" + Date.now(),
        author: author || "Gamer",
        text: text.trim(),
        date: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + " - Today",
        likes: 0
    };

    posts.unshift(newPost);
    savePosts(posts);
    res.json({ success: true, post: newPost });
});

// Aggiungi un Like a un post
app.post('/api/posts/like', (req, res) => {
    const { postId } = req.body;
    const posts = getPosts();
    const post = posts.find(p => p.id === postId);

    if (post) {
        post.likes = (post.likes || 0) + 1;
        savePosts(posts);
        return res.json({ success: true, likes: post.likes });
    }
    res.status(404).json({ success: false, message: 'Post not found' });
});

// Elimina un post
app.post('/api/posts/delete', (req, res) => {
    const { postId, username } = req.body;
    let posts = getPosts();
    const post = posts.find(p => p.id === postId);

    if (post) {
        // Solo l'autore del post (o l'admin/Team) può eliminarlo
        if (post.author === username || post.author === "GameZone Team") {
            posts = posts.filter(p => p.id !== postId);
            savePosts(posts);
            return res.json({ success: true });
        } else {
            return res.status(403).json({ success: false, message: 'You can only delete your own posts!' });
        }
    }
    res.status(404).json({ success: false, message: 'Post not found' });
});

// --- API CUSTOMER SUPPORT ---
app.post('/api/support', (req, res) => {
    const { username, issueType, message } = req.body;

    if (!message || !message.trim()) {
        return res.status(400).json({ success: false, message: 'Message cannot be empty.' });
    }

    const tickets = getSupportTickets();
    const newTicket = {
        ticketId: "TICK-" + Date.now().toString().slice(-5),
        username: username || "Guest",
        issueType: issueType,
        message: message.trim(),
        date: new Date().toISOString()
    };

    tickets.push(newTicket);
    saveSupportTickets(tickets);

    console.log(`📩 Nuovo ticket di supporto salvato: ${newTicket.ticketId}`);
    res.json({ success: true, ticketId: newTicket.ticketId });
});

app.listen(PORT, () => {
    console.log(`🚀 Server Full-Stack GameZone attivo su http://localhost:${PORT}`);
});

// --- API SUPPORTO (ADMIN) ---
app.get('/api/support/tickets', (req, res) => {
    // Supponendo che tu abbia una funzione o un modo per leggere support.json
    if (typeof getSupportTickets === 'function') {
        res.json(getSupportTickets());
    } else {
        // Fallback per leggere direttamente il file se non usi una funzione helper dedicata
        try {
            const data = fs.readFileSync(path.join(__dirname, 'support.json'), 'utf8');
            res.json(JSON.parse(data));
        } catch (err) {
            res.json([]);
        }
    }
});