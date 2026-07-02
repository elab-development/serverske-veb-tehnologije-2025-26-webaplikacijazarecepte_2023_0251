require('dotenv').config();
const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const bcrypt = require('bcrypt');
const fs = require('fs');
const path = require('path');
const connectDB = require('./config/db');

// Rute
const recipeRoutes = require('./routes/recipes');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const publicRoutes = require('./routes/public');
const Recipe = require('./models/Recipe');
const User = require('./models/User');

const app = express();

// Middleware
app.use(express.json());
app.use(cookieParser());

const corsOrigin = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map(s => s.trim())
  : ['http://localhost:4200', 'http://localhost:8080'];

app.use(cors({
  origin: corsOrigin,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Health Check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Backend API is running' });
});

// API rute
app.use('/api/recipes', recipeRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api', publicRoutes);

async function initializeDatabase() {
  try {
    const seedPath = path.join(__dirname, 'seed.json');
    const seedData = JSON.parse(fs.readFileSync(seedPath, 'utf-8'));

    const userCount = await User.countDocuments();

    if (userCount === 0) {
      console.log('Seeding database...');

      for (const user of seedData.users) {
        user.role = user.username === 'marko123' ? 'admin' : 'user';
        user.password = await bcrypt.hash(user.password, 10);
      }

      await User.insertMany(seedData.users);
      await Recipe.insertMany(seedData.recipes);

      console.log(`Seeded ${seedData.users.length} users and ${seedData.recipes.length} recipes`);
    } else {
      console.log(`Database already has ${userCount} users, skipping seed.`);
    }
  } catch (err) {
    console.error('Seed error:', err.message);
  }
}

// Konekcija na MongoDB i pokretanje servera
const PORT = process.env.PORT || 3000;

connectDB().then(() => {
  initializeDatabase().then(() => {
    app.listen(PORT, () => {
      console.log(`Server pokrenut na portu ${PORT}`);
    });
  });
});
