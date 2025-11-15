# 🌱 Carbon Footprint Tracker

A comprehensive web application for tracking and optimizing personal and corporate carbon footprints. Built with React, TypeScript, and Node.js.

## ✨ Features

### 🔐 Authentication & User Management
- User registration and login (Individual & Corporate)
- Role-based access control
- JWT-based authentication
- Profile management

### 📊 Carbon Tracking
- Personal carbon footprint calculation
- Activity logging (transportation, energy, food, etc.)
- Real-time emissions tracking
- Historical data analysis

### 🏢 Corporate Dashboard
- Team carbon footprint analytics
- ESG reporting capabilities
- Organization management
- Employee carbon tracking

### 🎯 Gamification
- Eco-points system
- Sustainability challenges
- Achievement badges
- Streak tracking
- Leaderboards

### 📈 Analytics & Reporting
- Interactive charts and graphs
- Weekly/monthly reports
- Carbon reduction insights
- Goal tracking and progress monitoring

### 🤖 AI-Powered Features
- ML-based carbon predictions
- Personalized recommendations
- Smart insights and tips

## 🛠️ Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development
- **Tailwind CSS** for styling
- **Lucide React** for icons
- **React Router** for navigation
- **Chart.js** for data visualization

### Backend
- **Node.js** with Express
- **TypeScript** for type safety
- **SQLite** database (development)
- **Sequelize** ORM
- **JWT** for authentication
- **Bcrypt** for password hashing
- **Swagger** for API documentation

## 🚀 Quick Start

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd carbon-footprint-tracker
```

2. **Install frontend dependencies**
```bash
npm install
```

3. **Install backend dependencies**
```bash
cd backend
npm install
```

4. **Set up environment variables**
```bash
cd backend
cp .env.example .env
# Edit .env with your configuration
```

5. **Start the development servers**

Backend (Terminal 1):
```bash
cd backend
npm run dev
```

Frontend (Terminal 2):
```bash
npm run dev
```

### Default Test Accounts
```
Individual User:
Email: user@test.com
Password: password123

Corporate Admin:
Email: corporate@test.com
Password: password123

Demo Account:
Email: demo@example.com
Password: password123
```

## 📁 Project Structure

```
carbon-footprint-tracker/
├── src/                    # Frontend source code
│   ├── components/         # React components
│   ├── pages/             # Page components
│   ├── hooks/             # Custom hooks
│   ├── utils/             # Utility functions
│   └── types/             # TypeScript types
├── backend/               # Backend source code
│   ├── src/
│   │   ├── controllers/   # Route controllers
│   │   ├── models/        # Database models
│   │   ├── routes/        # API routes
│   │   ├── middleware/    # Express middleware
│   │   └── utils/         # Backend utilities
│   └── dist/              # Compiled JavaScript
├── public/                # Static assets
└── docs/                  # Documentation
```

## 🔧 Available Scripts

### Frontend
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Backend
- `npm run dev` - Start development server with nodemon
- `npm run build` - Compile TypeScript
- `npm start` - Start production server
- `npm run migrate` - Run database migrations
- `npm run seed` - Seed database with test data

## 🌐 API Documentation

When the backend is running, visit:
- **Swagger UI**: http://localhost:3001/api-docs
- **API Base URL**: http://localhost:3001/api

## 🔒 Environment Variables

### Backend (.env)
```env
# Server Configuration
PORT=3001
NODE_ENV=development

# Database Configuration
DB_STORAGE=./carbon_tracker.db

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=7d

# API Configuration
CORS_ORIGIN=http://localhost:5173

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built for sustainability and environmental awareness
- Inspired by the need for carbon footprint reduction
- Designed with user experience and data privacy in mind

## 📞 Support

For support, email support@carbontracker.com or create an issue in this repository.
