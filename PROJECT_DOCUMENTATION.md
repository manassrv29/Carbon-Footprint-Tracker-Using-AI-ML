# Carbon Footprint Tracker - Project Documentation

## 📋 Table of Contents
1. [Project Overview](#project-overview)
2. [Architecture](#architecture)
3. [Directory Structure](#directory-structure)
4. [Database Models](#database-models)
5. [API Endpoints](#api-endpoints)
6. [Frontend Components](#frontend-components)
7. [Authentication & Security](#authentication--security)
8. [Features](#features)
9. [Development Setup](#development-setup)
10. [Deployment](#deployment)

---

## 🎯 Project Overview

**Carbon Footprint Tracker** is a comprehensive full-stack web application designed to help individuals and organizations monitor, track, and reduce their carbon emissions. The platform combines real-time tracking, gamification, analytics, and social features to encourage sustainable behavior.

### Key Objectives
- Track carbon emissions across multiple categories (transport, food, energy, waste)
- Provide actionable insights through data visualization
- Gamify the sustainability journey with points, levels, and achievements
- Enable corporate sustainability management
- Offer automated tracking through GPS, OCR, and barcode scanning

### Technology Stack
- **Frontend**: React 18 + TypeScript + Vite + Tailwind CSS
- **Backend**: Node.js + Express + TypeScript
- **Database**: SQLite with Sequelize ORM
- **Authentication**: JWT-based with bcrypt
- **Documentation**: Swagger/OpenAPI
- **File Handling**: Multer for uploads
- **Security**: Helmet, CORS, Rate Limiting

---

## 🏗️ Architecture

### System Architecture
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React Client  │◄──►│  Express API    │◄──►│  SQLite DB      │
│   (Port 5173)   │    │  (Port 3001)    │    │  (Local File)   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │              ┌─────────────────┐              │
         └──────────────►│  File Storage   │◄─────────────┘
                        │  (uploads/)     │
                        └─────────────────┘
```

### Data Flow
1. **User Interaction**: React components handle user input
2. **API Calls**: Axios requests to Express endpoints
3. **Authentication**: JWT tokens for secure access
4. **Data Processing**: Controllers process business logic
5. **Database Operations**: Sequelize ORM manages data
6. **Response**: JSON responses with standardized format

---

## 📁 Directory Structure

```
carbon-footprint-tracker/
├── 📁 backend/                     # Node.js/Express API
│   ├── 📁 src/
│   │   ├── 📁 controllers/         # Business logic handlers
│   │   │   ├── authController.ts
│   │   │   ├── carbonController.ts
│   │   │   ├── challengesController.ts
│   │   │   ├── corporateController.ts
│   │   │   ├── foodCarbonController.ts
│   │   │   ├── gamificationController.ts
│   │   │   ├── impactController.ts
│   │   │   ├── notificationsController.ts
│   │   │   ├── reportsController.ts
│   │   │   ├── settingsController.ts
│   │   │   ├── statsController.ts
│   │   │   └── uploadController.ts
│   │   ├── 📁 middleware/          # Express middleware
│   │   │   ├── auth.ts            # JWT authentication
│   │   │   ├── errorHandler.ts    # Error handling
│   │   │   ├── rateLimiter.ts     # Rate limiting
│   │   │   └── validation.ts      # Input validation
│   │   ├── 📁 models/             # Database models
│   │   │   ├── Achievement.ts
│   │   │   ├── Badge.ts
│   │   │   ├── CarbonLog.ts
│   │   │   ├── Challenge.ts
│   │   │   ├── ChallengeParticipation.ts
│   │   │   ├── EmissionFactor.ts
│   │   │   ├── Organization.ts
│   │   │   ├── User.ts
│   │   │   └── index.ts
│   │   ├── 📁 routes/             # API route definitions
│   │   │   ├── auth.ts
│   │   │   ├── carbon.ts
│   │   │   ├── challenges.ts
│   │   │   ├── corporate.ts
│   │   │   ├── foodCarbon.ts
│   │   │   ├── gamification.ts
│   │   │   ├── impact.ts
│   │   │   ├── notifications.ts
│   │   │   ├── reports.ts
│   │   │   ├── settings.ts
│   │   │   ├── stats.ts
│   │   │   ├── upload.ts
│   │   │   └── index.ts
│   │   ├── 📁 types/              # TypeScript interfaces
│   │   ├── 📁 utils/              # Utility functions
│   │   └── server.ts              # Express server setup
│   ├── 📁 uploads/                # File upload storage
│   │   ├── profiles/              # Profile images
│   │   └── receipts/              # Receipt images
│   ├── 📄 .env                    # Environment variables
│   ├── 📄 package.json
│   └── 📄 tsconfig.json
├── 📁 src/                        # React frontend
│   ├── 📁 components/             # React components
│   │   ├── 📁 auth/               # Authentication components
│   │   ├── 📁 calculator/         # Carbon calculator
│   │   ├── 📁 dashboard/          # Dashboard components
│   │   ├── 📁 gamification/       # Gamification features
│   │   ├── 📁 impact/             # Impact visualization
│   │   ├── 📁 layout/             # Layout components
│   │   ├── 📁 reports/            # Report components
│   │   ├── 📁 tracking/           # Auto-tracking features
│   │   └── 📁 ui/                 # Reusable UI components
│   ├── 📁 pages/                  # Page components
│   ├── 📁 types/                  # TypeScript interfaces
│   ├── 📁 utils/                  # Utility functions
│   ├── 📁 data/                   # Static data
│   └── 📁 assets/                 # Static assets
├── 📁 ML_Models/                  # Machine learning models
│   ├── carbonemission1.py
│   ├── future_prediction.py
│   └── recommendation_model.py
├── 📄 package.json
├── 📄 vite.config.ts
├── 📄 tailwind.config.js
└── 📄 README.md
```

---

## 🗄️ Database Models

### User Model
```typescript
interface User {
  id: number;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  role: 'user' | 'corporate';
  organizationId?: number;
  level: number;
  ecoPoints: number;
  streak: number;
  totalCo2Saved: number;
  weeklyReduction: number;
  dailyTarget: number;
  isActive: boolean;
  lastLoginAt?: Date;
  settings?: string; // JSON string
  longestStreak?: number;
  lastActiveDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}
```

### CarbonLog Model
```typescript
interface CarbonLog {
  id: number;
  userId: number;
  category: 'transport' | 'food' | 'energy' | 'other';
  activityType: string;
  value: number;
  co2Kg: number;
  source: 'manual' | 'gps' | 'ocr' | 'api';
  metadata?: object;
  timestamp: Date;
  createdAt: Date;
  updatedAt: Date;
}
```

### Organization Model
```typescript
interface Organization {
  id: number;
  name: string;
  domain?: string;
  industry?: string;
  size?: 'startup' | 'small' | 'medium' | 'large' | 'enterprise';
  country?: string;
  website?: string;
  description?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

### Challenge Model
```typescript
interface Challenge {
  id: number;
  title: string;
  description: string;
  icon: string;
  category: string;
  startDate: Date;
  endDate: Date;
  targetMetric: string;
  targetValue: number;
  rewardPoints: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

### Achievement Model
```typescript
interface Achievement {
  id: number;
  userId: number;
  badgeId: string;
  unlockedAt: Date;
  createdAt: Date;
}
```

### Badge Model
```typescript
interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  requirement: object;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

### EmissionFactor Model
```typescript
interface EmissionFactor {
  id: number;
  category: string;
  type: string;
  factor: number;
  unit: string;
  source: string;
  region?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

---

## 🔌 API Endpoints

### Authentication Endpoints (`/api/auth`)
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/register` | User registration | No |
| POST | `/login` | User login | No |
| GET | `/profile` | Get user profile | Yes |
| PUT | `/profile` | Update user profile | Yes |
| DELETE | `/account` | Delete user account | Yes |

### Carbon Tracking (`/api/carbon`)
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/logs` | Get carbon logs | Yes |
| POST | `/logs` | Create carbon log | Yes |
| PUT | `/logs/:id` | Update carbon log | Yes |
| DELETE | `/logs/:id` | Delete carbon log | Yes |
| GET | `/stats` | Get carbon statistics | Yes |
| POST | `/auto-track` | Auto-track emissions | Yes |
| GET | `/export` | Export user data | Yes |

### Reports (`/api/reports`)
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/weekly` | Get weekly report | Yes |
| GET | `/monthly` | Get monthly report | Yes |

### Settings (`/api/settings`)
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/` | Get user settings | Yes |
| PUT | `/` | Update user settings | Yes |
| POST | `/reset` | Reset to defaults | Yes |

### Gamification (`/api/gamification`)
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/level` | Get user level | Yes |
| GET | `/points` | Get eco points | Yes |
| GET | `/streak` | Get streak info | Yes |
| GET | `/badges` | Get user badges | Yes |
| GET | `/rewards` | Get available rewards | Yes |
| POST | `/rewards/:id/claim` | Claim reward | Yes |
| GET | `/progress` | Get overall progress | Yes |

### Impact Visualization (`/api/impact`)
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/visualization` | Get impact data | Yes |
| GET | `/equivalents` | Get environmental equivalents | Yes |
| GET | `/comparison` | Compare with averages | Yes |
| GET | `/trends` | Get impact trends | Yes |
| GET | `/global` | Get global statistics | Yes |

### File Upload (`/api/upload`)
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/profile-image` | Upload profile image | Yes |
| POST | `/receipt` | Upload receipt for OCR | Yes |

### Notifications (`/api/notifications`)
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/` | Get notifications | Yes |
| PATCH | `/:id/read` | Mark as read | Yes |
| PATCH | `/read-all` | Mark all as read | Yes |
| GET | `/settings` | Get notification settings | Yes |
| PUT | `/settings` | Update notification settings | Yes |
| POST | `/test` | Send test notification | Yes |

### Challenges (`/api/challenges`)
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/` | Get available challenges | Yes |
| POST | `/:id/join` | Join challenge | Yes |
| DELETE | `/:id/leave` | Leave challenge | Yes |
| GET | `/user` | Get user challenges | Yes |
| PUT | `/:id/progress` | Update progress | Yes |

### Statistics (`/api/stats`)
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/user` | Get user statistics | Yes |
| GET | `/leaderboard` | Get leaderboard | Yes |
| GET | `/achievements` | Get user achievements | Yes |
| POST | `/achievements/:id/unlock` | Unlock achievement | Yes |
| GET | `/global` | Get global statistics | Yes |

### Corporate (`/api/corporate`)
| Method | Endpoint | Description | Auth Required | Role Required |
|--------|----------|-------------|---------------|---------------|
| GET | `/dashboard` | Corporate dashboard | Yes | Corporate |
| GET | `/employees` | Get employees | Yes | Corporate |
| GET | `/analytics` | Get analytics | Yes | Corporate |
| PUT | `/organization` | Update organization | Yes | Corporate |

### Food Carbon Database (`/api/food-carbon`)
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/search` | Search food items | No |
| GET | `/barcode/:code` | Get by barcode | No |

---

## 🎨 Frontend Components

### Core Components
- **App.tsx** - Main application component with routing
- **AuthProvider** - Authentication context provider
- **ProtectedRoute** - Route protection wrapper

### Authentication Components
- **LoginForm** - User login interface
- **RegisterForm** - User registration interface
- **ProfileSettings** - User profile management

### Dashboard Components
- **CarbonDashboard** - Main dashboard with statistics
- **UserHomePage** - User home page layout
- **CorporateDashboard** - Corporate admin dashboard

### Tracking Components
- **EnhancedCarbonCalculator** - Carbon emission calculator
- **AutoTrackingHub** - GPS/OCR/Barcode tracking
- **ManualEntry** - Manual emission logging

### Reports Components
- **WeeklyReport** - Weekly emission reports
- **MonthlyReport** - Monthly emission reports
- **ImpactVisualization** - Charts and analytics

### Gamification Components
- **GamificationHub** - Challenges and leaderboards
- **AchievementBadges** - Badge display system
- **ProgressTracker** - Level and streak tracking

### UI Components
- **Button** - Reusable button component
- **Card** - Card layout component
- **Modal** - Modal dialog component
- **Navigation** - Main navigation component

---

## 🔐 Authentication & Security

### JWT Authentication
- **Token Generation**: On successful login
- **Token Storage**: localStorage (frontend)
- **Token Validation**: Middleware on protected routes
- **Token Expiry**: 7 days (configurable)

### Security Features
- **Password Hashing**: bcrypt with salt rounds
- **Rate Limiting**: 100 requests per 15 minutes
- **CORS Protection**: Configured for frontend origin
- **Helmet Security**: Security headers
- **Input Validation**: Joi schemas
- **SQL Injection Protection**: Sequelize ORM

### Role-Based Access Control
- **User Role**: Individual carbon tracking
- **Corporate Role**: Organization management
- **Route Protection**: Middleware validation

---

## ✨ Features

### Core Features
1. **Carbon Emission Tracking**
   - Manual entry across categories
   - Real-time CO₂ calculations
   - Historical data analysis

2. **Auto-Tracking Capabilities**
   - GPS-based transport tracking
   - OCR receipt processing
   - Barcode scanning for food items

3. **Gamification System**
   - Experience points and levels
   - Achievement badges
   - Streak tracking
   - Challenges and competitions

4. **Analytics & Reports**
   - Weekly/monthly reports
   - Category breakdowns
   - Trend analysis
   - Environmental impact equivalents

5. **Social Features**
   - Leaderboards
   - Challenge participation
   - Progress sharing

### Advanced Features
1. **Corporate Management**
   - Employee carbon tracking
   - Organization analytics
   - Sustainability reporting

2. **Notification System**
   - In-app notifications
   - Email notifications
   - Achievement alerts

3. **Data Visualization**
   - Interactive charts
   - Progress tracking
   - Impact comparisons

4. **Settings & Preferences**
   - Notification preferences
   - Privacy settings
   - Auto-tracking configuration

---

## 🚀 Development Setup

### Prerequisites
- Node.js 18+ and npm
- Git

### Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Configure environment variables
npm run dev
```

### Frontend Setup
```bash
npm install
npm run dev
```

### Environment Variables
```env
# Backend (.env)
NODE_ENV=development
PORT=3001
JWT_SECRET=your-jwt-secret
DB_PATH=./database.sqlite
FRONTEND_URL=http://localhost:5173
```

### Database Setup
- SQLite database auto-created on first run
- Sequelize handles migrations and seeding
- Test data automatically populated

---

## 📦 Deployment

### Production Build
```bash
# Backend
cd backend
npm run build
npm start

# Frontend
npm run build
npm run preview
```

### Environment Configuration
- Set NODE_ENV=production
- Configure production database
- Set secure JWT secret
- Configure CORS for production domain

### Recommended Hosting
- **Backend**: Railway, Heroku, DigitalOcean
- **Frontend**: Vercel, Netlify, GitHub Pages
- **Database**: PostgreSQL for production

---

## 📊 API Response Format

### Success Response
```json
{
  "success": true,
  "data": {
    // Response data
  },
  "message": "Operation successful"
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error message",
  "details": {
    // Additional error details
  }
}
```

---

## 🧪 Testing

### Test Credentials
- **Demo User**: demo@example.com / password123
- **Basic User**: user@test.com / password123
- **Corporate Admin**: corporate@test.com / password123

### API Testing
- Swagger UI: http://localhost:3001/api-docs
- Postman collection available
- cURL examples in documentation

---

## 📈 Performance Considerations

### Database Optimization
- Indexed columns for frequent queries
- Pagination for large datasets
- Efficient joins and relationships

### API Optimization
- Rate limiting to prevent abuse
- Response caching where appropriate
- Optimized query patterns

### Frontend Optimization
- Code splitting with React.lazy
- Optimized bundle size
- Efficient state management

---

## 🔧 Maintenance

### Monitoring
- Error logging and tracking
- Performance monitoring
- User activity analytics

### Updates
- Regular dependency updates
- Security patch management
- Feature rollout strategy

### Backup Strategy
- Database backup procedures
- File upload backup
- Configuration backup

---

*This documentation is maintained alongside the codebase and should be updated with any architectural changes or new features.*
