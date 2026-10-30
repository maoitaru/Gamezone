# 🎮 GameZone - Steam-Style Web Platform

GameZone is a full-stack web application inspired by gaming hubs like Steam. It features user authentication, a dynamic game store with modal previews, a personalized library, interactive community posts with topic filters and emojis, an admin support dashboard, and persistent data storage.

---

## 🌟 Key Features

* **Authentication & Authorization**:
  * Secure Sign In / Sign Up flow.
  * Account lockout protection (3 failed attempts require password reset).
  * Persistent user sessions via browser storage.
  * Role-restricted Admin Dashboard (`admin123` access code).

* **Dynamic Store & Library**:
  * Carousel featuring 3 highlighted titles with direct "Add to Library" capability.
  * Game generation with live search and genre selection.
  * Interactive Game Detail Modal with custom user reviews.
  * Personal Game Library management (Add / Remove owned games).

* **Community Hub**:
  * Filter posts by active topics (*General, Guides & Tips, LFG, Screenshots*).
  * Integrated emoji picker for main posts and comments.
  * Unique user like/unlike toggle system.
  * Author-restricted post deletion.

* **Customer Support & Admin Dashboard**:
  * User support ticket submission form.
  * Admin ticketing dashboard to inspect, update ticket status (*Pending, In Progress, Resolved*), or delete resolved issues.

---

## 🛠️ Tech Stack

* **Frontend**: HTML5, CSS3 (Custom Flexbox & Media Queries), Modern JavaScript (ES6+), Fetch API.
* **Backend**: Node.js, Express.js.
* **Storage**: Persistent JSON-based storage (`users.json`, `posts.json`, `support.json`).

---

## 🚀 Getting Started

### Prerequisites

* Node.js (v14.0 or higher)
* npm (Node Package Manager)

### Installation & Local Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-username/gamezone.git
   cd gamezone
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the Express server**:
   ```bash
   node server.js
   ```

4. **Access the application**:
   Open your browser and navigate to `http://localhost:3000`.

---

## 📂 Project Structure

```text
gamezone/
├── index.html       # Main Application Dashboard View
├── login.html       # User Sign In Page & Password Reset Modal
├── register.html    # New User Registration Page
├── style.css        # Responsive Steam-styled CSS Theme
├── script.js       # Client-side Logic & DOM Interactivity
├── server.js        # Express Server & RESTful API Endpoints
├── users.json       # User Accounts & Library Storage
├── posts.json       # Community Hub Posts & Comments Storage
└── support.json     # Customer Support Tickets Storage
```

---

## 🌐 Deployment to Cloud (Render / Railway)

To host GameZone online for free:

1. Push your project files to a public GitHub repository.
2. Sign up on **[Render.com](https://render.com/)**.
3. Create a **New Web Service** and connect your GitHub repository.
4. Set the build and start commands:
   * **Build Command**: `npm install`
   * **Start Command**: `node server.js`
5. Click **Deploy Web Service**. Render will supply a public HTTPS link for your live portfolio app!

---

## 📄 License

This project is open-source and created for educational and portfolio demonstration purposes.