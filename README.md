# 🥗 SmartExpiryProject

Reduce food waste. Save money. Cook smarter.

SmartExpiryProject helps users track grocery expiry dates, understand weekly savings/loss, and get cooking suggestions based on available items.

---

## ✨ Features

### 🔐 Authentication

- Signup / Login using JWT
- Secure password handling

### 📦 Item Management

- Add food items with expiry dates
- View & delete items
- Items are user-specific

### ⏰ Expiry Tracking

- Highlights expired & near-expiry items

### 📊 Dashboard

- Personalized summary per user
- Weekly savings & loss calculation

### 🍳 Cooking Suggestions

- Uses TheMealDB API
- Suggests recipes based on stored items

---

## 🧠 Tech Stack
```bash
- Frontend-React
- Backend-Node.js, Express
- Database-MongoDB
- Auth-JWT
- Recipe API-TheMealDB
```
---

## 📁 Folder Structure
```bash

SmartExpiryProject/
├── frontend/      # React UI, components, pages
└── backend/       # Express server, APIs, DB logic
```

---

## ✅ Prerequisites

*Make sure you have:*

- Node.js ≥ 18.x
- npm
- MongoDB Atlas and local MongoDB(optional)

---

## 🔐 Environment Variables

### 📌 Backend (backend/.env)
```bash

MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
PORT=5000
```

### 📌 Frontend (frontend/.env)
```bash

REACT_APP_API_URL=http://localhost:5000
```

---

## 🚀 Quick Start (5 Minutes)

1. Clone repo & cd into it
2. Copy .env.example to backend/.env and frontend/.env
3. Add your MongoDB URI & JWT secret
4. Run: cd backend && npm install && npm run dev
5. In another terminal: cd frontend && npm install && npm start
6. Open http://localhost:3000

---

## 📦 Installation

### Backend
```bash
cd backend
npm install
```

### Frontend
```bash
cd ../frontend
npm install
```

### ▶️ Run Locally
```bash

*Terminal 1 – Backend*
cd backend
npm run dev

*Terminal 2 – Frontend*
cd frontend
npm start


*App runs at:*
👉 http://localhost:3000
```

---

## 👩‍💻 Author

## Anisa Barvin

📧 Email: barvinanisa@gmail.com

🔗 GitHub: https://github.com/Anisa-barvin

## Anika V

📧 Email: anikavadivel@gmail.com

🔗 GitHub: https://github.com/Anika02023

## Archana gurusamy

📧 Email: archanagurusamy648@gmail.com

🔗 GitHub: https://github.com/ARCHANA-SENGUNTHAR

## Hemalatha P N

📧 Email: hemalathanatarajan28@gmail.com

🔗 GitHub: https://github.com/hemalatha2005
