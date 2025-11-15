const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
}));
app.use(morgan('dev'));
app.use(express.json());

// Simple health check
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Carbon Footprint Tracker API',
    version: '1.0.0',
    status: 'running',
    timestamp: new Date().toISOString(),
  });
});

app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'API is healthy',
    timestamp: new Date().toISOString(),
  });
});

// Mock endpoints for frontend testing
app.post('/api/auth/register', (req, res) => {
  res.json({
    success: true,
    data: {
      user: {
        id: 1,
        email: req.body.email,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        level: 1,
        ecoPoints: 0,
        streak: 0,
        totalCo2Saved: 0,
        dailyTarget: 50,
      },
      tokens: {
        accessToken: 'mock-jwt-token',
        expiresIn: 604800,
      },
    },
    message: 'User registered successfully',
  });
});

app.post('/api/auth/login', (req, res) => {
  res.json({
    success: true,
    data: {
      user: {
        id: 1,
        email: req.body.email,
        firstName: 'Demo',
        lastName: 'User',
        level: 2,
        ecoPoints: 1250,
        streak: 7,
        totalCo2Saved: 45.2,
        dailyTarget: 50,
      },
      tokens: {
        accessToken: 'mock-jwt-token',
        expiresIn: 604800,
      },
    },
    message: 'Login successful',
  });
});

app.get('/api/auth/profile', (req, res) => {
  res.json({
    success: true,
    data: {
      id: 1,
      email: 'demo@example.com',
      firstName: 'Demo',
      lastName: 'User',
      level: 2,
      ecoPoints: 1250,
      streak: 7,
      totalCo2Saved: 45.2,
      weeklyReduction: 12.3,
      dailyTarget: 50,
    },
  });
});

app.post('/api/carbon/logs', (req, res) => {
  const co2Kg = Math.random() * 10;
  const ecoPoints = Math.floor(co2Kg * 10);
  
  res.status(201).json({
    success: true,
    data: {
      carbonLog: {
        id: Date.now(),
        category: req.body.category,
        activityType: req.body.activityType,
        value: req.body.value,
        co2Kg: co2Kg,
        source: req.body.source || 'manual',
        timestamp: new Date(),
      },
      ecoPointsEarned: ecoPoints,
      userStats: {
        level: 2,
        ecoPoints: 1250 + ecoPoints,
        streak: 7,
        totalCo2Saved: 45.2 + co2Kg,
      },
    },
    message: 'Carbon log created successfully',
  });
});

app.get('/api/stats/leaderboard', (req, res) => {
  res.json({
    success: true,
    data: {
      leaderboard: [
        { userId: 1, firstName: 'Demo', lastName: 'User', ecoPoints: 1250, totalCo2Saved: 45.2, rank: 1 },
        { userId: 2, firstName: 'Jane', lastName: 'Smith', ecoPoints: 1100, totalCo2Saved: 38.7, rank: 2 },
        { userId: 3, firstName: 'Mike', lastName: 'Johnson', ecoPoints: 950, totalCo2Saved: 32.1, rank: 3 },
      ],
      period: 'all',
      totalUsers: 3,
    },
  });
});

app.get('/api/challenges', (req, res) => {
  res.json({
    success: true,
    data: [
      {
        id: 1,
        title: 'Green Week Challenge',
        description: 'Reduce your carbon footprint by 20% this week',
        icon: '🌿',
        category: 'weekly',
        startDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        endDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        targetValue: 20,
        rewardPoints: 500,
        participantCount: 45,
        daysRemaining: 5,
        isOngoing: true,
      },
      {
        id: 2,
        title: 'Plant-Based October',
        description: 'Eat plant-based meals for the entire month',
        icon: '🥬',
        category: 'monthly',
        startDate: new Date(2024, 9, 1),
        endDate: new Date(2024, 9, 31),
        targetValue: 60,
        rewardPoints: 1000,
        participantCount: 128,
        daysRemaining: 8,
        isOngoing: true,
      },
    ],
  });
});

app.get('/api/stats/global', (req, res) => {
  res.json({
    success: true,
    data: {
      totalUsers: 1247,
      totalCo2Saved: 15420.5,
      totalLogs: 8934,
      averageUserLevel: 3,
      recentActivity: {
        weeklyLogs: 234,
      },
      globalImpact: {
        trees: 701,
        carDistance: 73431,
        energySaved: 30841,
        waterImpact: 15420500,
      },
    },
  });
});

// Error handling
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
    message: `Cannot ${req.method} ${req.path}`,
  });
});

app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: err.message,
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Carbon Tracker API Server running on port ${PORT}`);
  console.log(`📚 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🌍 Frontend URL: http://localhost:5173`);
  console.log(`✅ Mock API endpoints ready for testing`);
});
