# 🥗 SmartExpiryProject

**Reduce food waste. Save money. Cook smarter.**

SmartExpiryProject is a **full-stack web application** designed to help users intelligently track grocery expiry dates, minimize food waste, calculate weekly savings/loss, and discover creative recipes based on available items. Built with modern technologies including React, Node.js/Express, and MongoDB, this project demonstrates end-to-end application development with secure authentication, real-time data management, and third-party API integration.

### 🎯 Problem Statement
Millions of tons of food waste occur annually due to lack of tracking and awareness. SmartExpiryProject bridges this gap by providing an intuitive platform for household inventory management and smart cooking suggestions.

### ⭐ Key Highlights
- **Full-Stack Web Application** with responsive UI and scalable backend
- **Secure Authentication** using JWT tokens with password hashing
- **Real-time Inventory Management** with expiry date tracking and notifications
- **Third-party API Integration** with TheMealDB for dynamic recipe suggestions
- **Financial Analytics** calculating weekly savings and potential losses
- **User-Specific Data** with MongoDB documents isolated per user

---

## ✨ Features

### 🔐 Authentication & Security
- JWT-based authentication with secure token management
- Password hashing for data security
- Protected routes and middleware-based authorization
- User session management

### 📦 Inventory Management
- Add, view, update, and delete food items
- Track expiry dates with automatic categorization
- Item quantity and cost tracking
- User-specific data isolation using MongoDB ObjectIDs

### ⏰ Smart Expiry Tracking
- Real-time expiry status (Fresh, Expiring Soon, Expired)
- Automated alerts for near-expiry items
- Visual indicators and sorting capabilities
- Historical expiry tracking for analytics

### 📊 Advanced Dashboard Analytics
- Personalized user dashboard with key metrics
- Weekly savings/loss calculation based on item costs
- Waste reduction insights
- Item category breakdown and statistics

### 🍳 Intelligent Recipe Suggestions
- Integration with TheMealDB API for recipe discovery
- Recipes matched to available inventory items
- Nutrition information and cooking instructions
- Cost-effective meal planning recommendations

### 📱 Barcode Scanning
- Quick item addition via barcode scanning
- Streamlined inventory entry process

---

## 🧠 Tech Stack

**Frontend:**
- React.js with functional components and hooks
- Tailwind CSS for responsive UI design
- PostCSS for advanced styling
- React Router for client-side navigation
- Axios for HTTP requests

**Backend:**
- Node.js with Express.js framework
- RESTful API architecture
- Middleware-based request handling
- Error handling and validation

**Database:**
- MongoDB for NoSQL document storage
- Mongoose ODM (optional) for schema management
- Data indexing for optimized queries

**Authentication & Security:**
- JWT (JSON Web Tokens) for stateless authentication
- Bcrypt for password hashing
- CORS configuration for security

**Third-party Integration:**
- TheMealDB API for recipe data
- RESTful API consumption and data transformation
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

**Terminal 1 – Backend Server**
```bash
cd backend
npm run dev
```
Backend runs on `http://localhost:5000`

**Terminal 2 – Frontend Application**
```bash
cd frontend
npm start
```
Frontend runs on `http://localhost:3000`

---

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login (returns JWT token)

### Items Management
- `GET /api/items` - Fetch all items for logged-in user
- `POST /api/items` - Add new item
- `PUT /api/items/:id` - Update item details
- `DELETE /api/items/:id` - Delete item

### Dashboard
- `GET /api/dashboard` - Get user dashboard analytics
- `GET /api/dashboard/stats` - Weekly savings and loss metrics

### Health Check
- `GET /api/health` - Server health status

---

## 💡 Skills Demonstrated

✅ **Full-Stack Development** - End-to-end application building  
✅ **RESTful API Design** - Clean, scalable API architecture  
✅ **Database Design** - Schema planning and data relationships  
✅ **Authentication & Security** - JWT implementation and password hashing  
✅ **Third-party API Integration** - External service consumption and data mapping  
✅ **Responsive UI Design** - Mobile-first approach with Tailwind CSS  
✅ **State Management** - React hooks and component lifecycle  
✅ **Error Handling** - Comprehensive error management across stack  
✅ **Git Version Control** - Project collaboration and version management

---

## � Future Enhancements

- **Push Notifications** - Real-time alerts for expiring items
- **Machine Learning** - Predictive inventory management
- **Mobile App** - Native iOS/Android application
- **Email Notifications** - Weekly digest of expiring items
- **Social Features** - Recipe sharing and community recommendations
- **Cloud Deployment** - AWS/Azure integration for scalability
- **Advanced Analytics** - AI-powered expense optimization

---

## 📊 Project Statistics

| Metric | Value |
|--------|-------|
| Frontend Components | 12+ |
| Backend Routes | 15+ |
| Database Collections | 2 (Users, Items) |
| API Endpoints | 10+ |
| Third-party APIs | 1 (TheMealDB) |
| Tech Stack | MERN (Node.js variant) |

---

## 📝 License

This project is open source and available under the MIT License.

---

## 👩‍💻 Author

**Hemalatha P N**

📧 Email: hemalathanatarajan28@gmail.com  
🔗 GitHub: https://github.com/hemalatha2005
