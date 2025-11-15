# Carbon Footprint Tracker - Backend API

A comprehensive Node.js/Express backend API for the Carbon Footprint Tracker application with MySQL database integration.

## 🚀 Features

- **User Authentication** - JWT-based auth with registration, login, and profile management
- **Carbon Logging** - CRUD operations for tracking carbon footprint activities
- **Gamification** - Challenges, achievements, badges, and leaderboards
- **Statistics** - User stats, global stats, and real-world impact calculations
- **Real-time Calculations** - CO₂ emissions and eco-points based on IPCC data
- **API Documentation** - Interactive Swagger/OpenAPI documentation
- **Security** - Rate limiting, CORS, helmet, input validation
- **Database** - MySQL with Sequelize ORM and proper relationships

## 📋 Prerequisites

- Node.js 18+ 
- MySQL 8.0+
- npm or yarn

## 🛠️ Installation

1. **Clone and navigate to backend directory:**
   ```bash
   cd carbon-footprint-tracker/backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   ```bash
   cp .env.example .env
   ```
   
   Update `.env` with your database credentials:
   ```env
   DB_HOST=localhost
   DB_PORT=3306
   DB_NAME=carbon_tracker
   DB_USER=your_mysql_user
   DB_PASSWORD=your_mysql_password
   JWT_SECRET=your_super_secret_jwt_key
   ```

4. **Create MySQL database:**
   ```sql
   CREATE DATABASE carbon_tracker;
   ```

5. **Build TypeScript:**
   ```bash
   npm run build
   ```

6. **Run database seeders:**
   ```bash
   npm run seed
   ```

## 🏃‍♂️ Running the Server

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

The server will start on `http://localhost:3001`

## 📚 API Documentation

Interactive API documentation is available at:
- **Swagger UI**: `http://localhost:3001/api-docs`
- **Health Check**: `http://localhost:3001/api/health`

## 🗂️ Project Structure

```
backend/
├── src/
│   ├── config/
│   │   └── database.ts          # Database configuration
│   ├── controllers/
│   │   ├── authController.ts    # Authentication endpoints
│   │   ├── carbonController.ts  # Carbon logging endpoints
│   │   ├── challengeController.ts # Challenge endpoints
│   │   └── statsController.ts   # Statistics endpoints
│   ├── middleware/
│   │   ├── auth.ts             # JWT authentication
│   │   ├── validation.ts       # Request validation
│   │   └── errorHandler.ts     # Error handling
│   ├── models/
│   │   ├── User.ts             # User model
│   │   ├── CarbonLog.ts        # Carbon log model
│   │   ├── Challenge.ts        # Challenge models
│   │   ├── Achievement.ts      # Achievement/Badge models
│   │   └── EmissionFactor.ts   # Emission factor model
│   ├── routes/
│   │   ├── auth.ts             # Auth routes
│   │   ├── carbon.ts           # Carbon routes
│   │   ├── challenges.ts       # Challenge routes
│   │   └── stats.ts            # Statistics routes
│   ├── utils/
│   │   └── emissions.ts        # Emission calculations
│   ├── types/
│   │   └── index.ts            # TypeScript interfaces
│   ├── seeders/
│   │   └── seed.ts             # Database seeders
│   └── server.ts               # Main server file
├── .env                        # Environment variables
├── .env.example               # Environment template
├── package.json               # Dependencies and scripts
├── tsconfig.json              # TypeScript configuration
└── README.md                  # This file
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile
- `DELETE /api/auth/account` - Delete user account

### Carbon Logging
- `POST /api/carbon/logs` - Create carbon log
- `GET /api/carbon/logs` - Get user's carbon logs
- `GET /api/carbon/logs/:id` - Get specific carbon log
- `PUT /api/carbon/logs/:id` - Update carbon log
- `DELETE /api/carbon/logs/:id` - Delete carbon log
- `GET /api/carbon/stats` - Get carbon statistics

### Challenges
- `GET /api/challenges` - Get all challenges
- `GET /api/challenges/:id` - Get specific challenge
- `POST /api/challenges/:id/join` - Join challenge
- `DELETE /api/challenges/:id/leave` - Leave challenge
- `GET /api/challenges/my/challenges` - Get user's challenges
- `PUT /api/challenges/:id/progress` - Update challenge progress

### Statistics
- `GET /api/stats/user` - Get user statistics
- `GET /api/stats/leaderboard` - Get leaderboard
- `GET /api/stats/achievements` - Get user achievements
- `POST /api/stats/achievements/:badgeId/unlock` - Unlock achievement
- `GET /api/stats/global` - Get global statistics

## 🗄️ Database Schema

### Core Tables
- **users** - User accounts and statistics
- **carbon_logs** - Individual carbon footprint entries
- **challenges** - Available challenges
- **challenge_participations** - User challenge participation
- **badges** - Available achievement badges
- **achievements** - User unlocked achievements
- **emission_factors** - CO₂ emission calculation factors

### Key Relationships
- Users have many CarbonLogs
- Users have many Achievements
- Users participate in many Challenges
- Challenges have many Participations
- Badges have many Achievements

## 🧮 Emission Calculations

The system uses scientifically-backed emission factors from:
- **IPCC 2021** for transport emissions
- **FAO 2019** for food emissions  
- **IEA 2021** for energy emissions

### Categories Supported
- **Transport**: Cars, buses, trains, flights, motorcycles, bicycles
- **Food**: Meat, dairy, vegetables, fruits, grains, legumes
- **Energy**: Electricity, natural gas, renewable sources

## 🎮 Gamification System

### Eco Points
- Earned based on CO₂ saved (10 points per kg CO₂)
- Category multipliers for different activities
- Used for leveling up and leaderboards

### Badges & Achievements
- **First Steps** - Log first activity
- **Eco Warrior** - 7-day streak
- **Carbon Saver** - Save 100kg CO₂
- **Point Collector** - Earn 1000 points
- **Green Commuter** - 50 transport activities
- **Plant Based** - 30 plant-based meals
- **Energy Efficient** - 25 energy activities
- **Consistency King** - 30-day streak

### Challenges
- Weekly and monthly challenges
- Progress tracking and completion rewards
- Community leaderboards

## 🔒 Security Features

- **JWT Authentication** with secure token handling
- **Rate Limiting** to prevent API abuse
- **Input Validation** using Joi schemas
- **CORS Configuration** for frontend integration
- **Helmet.js** for security headers
- **Password Hashing** using bcryptjs

## 🚀 Deployment

### Environment Setup
1. Set `NODE_ENV=production`
2. Use strong JWT secret
3. Configure production database
4. Set up SSL/HTTPS
5. Configure reverse proxy (nginx)

### Docker Support (Optional)
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist ./dist
EXPOSE 3001
CMD ["npm", "start"]
```

## 🧪 Testing

Run the development server and test endpoints:

```bash
# Start server
npm run dev

# Test health endpoint
curl http://localhost:3001/api/health

# Register user
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","firstName":"Test","lastName":"User"}'
```

## 🤝 Contributing

1. Follow TypeScript best practices
2. Add proper error handling
3. Include JSDoc comments
4. Update API documentation
5. Test all endpoints

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Support

For issues and questions:
- Check the API documentation at `/api-docs`
- Review server logs for errors
- Ensure database connection is working
- Verify environment variables are set correctly
