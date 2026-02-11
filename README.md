🥗 SmartExpiryProject

Reduce food waste. Save money. Cook smarter.

SmartExpiryProject helps users track grocery expiry dates, understand weekly savings/loss, and get cooking suggestions based on available items.



✨ Features

🔐 Authentication

Signup / Login using JWT

Secure password handling


📦 Item Management

Add food items with expiry dates

View & delete items

Items are user-specific


⏰ Expiry Tracking

Highlights expired & near-expiry items


📊 Dashboard

Personalized summary per user

Weekly savings & loss calculation


🍳 Cooking Suggestions

Uses TheMealDB API

Suggests recipes based on stored items


👤 Profile

Change password

Secure account handling


🧠 Tech Stack
Layer	Technology
🎨 Frontend	React
⚙️ Backend	Node.js, Express
🗄 Database	MongoDB
🔐 Auth	JWT
🍽 Recipe API	TheMealDB
📁 Folder Structure
SmartExpiryProject/
├── frontend/      # React UI, components, pages
└── backend/       # Express server, APIs, DB logic


✅ Prerequisites

Make sure you have:

Node.js ≥ 18.x

npm

MongoDB Atlas or local MongoDB


🔐 Environment Variables
📌 Backend (backend/.env)
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
PORT=5000

📌 Frontend (frontend/.env)
REACT_APP_API_URL=http://localhost:5000



⚠️ Important

Never commit real secrets

Always add .env to .gitignore


📦 Installation
Backend
cd backend
npm install

Frontend
cd ../frontend
npm install

▶️ Run Locally
Terminal 1 – Backend
cd backend
npm run dev

Terminal 2 – Frontend
cd frontend
npm start


App runs at:
👉 http://localhost:3000

🔗 API Endpoints (Quick View)

🔐 Auth

POST /api/auth/signup

POST /api/auth/login

PUT /api/auth/change-password


📦 Items

GET /api/items

POST /api/items

DELETE /api/items/:id


📊 Dashboard

GET /api/dashboard/summary

🧩 Key Behavior Notes

🔒 All items are linked to userId

📊 Dashboard data is personalized

💰 Weekly savings/loss is calculated from expiry logic

🍽 Cooking suggestions use TheMealDB API

🛠 Common Troubleshooting


❌ Login failed

Check JWT_SECRET in backend/.env


🌐 CORS / Network error

Make sure backend is running on port 5000

Check frontend API URL


🔄 Changes not reflecting

Restart backend/frontend after editing .env


🔐 Security Notes

Rotate secrets if leaked

Never push .env or node_modules

Use HTTPS in production


🚀 Roadmap / Future Improvements

🔁 Backend proxy for recipe APIs

📈 Advanced analytics & reports

🔔 Expiry notifications (email / push)

📱 Mobile-friendly UI


💡 Why This Project?

SmartExpiryProject is built to:

Reduce food waste 🌍

Help students & families save money 💰

Encourage smarter cooking 🍳
