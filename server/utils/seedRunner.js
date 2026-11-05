require('dotenv').config();
const { connectDB } = require('../config/db');
const { seedDatabase } = require('./seedData');

const runSeed = async () => {
  try {
    await connectDB();
    await seedDatabase();
    console.log('[Seed Runner] Seeding completed.');
    process.exit(0);
  } catch (err) {
    console.error('[Seed Runner] Failed:', err);
    process.exit(1);
  }
};

runSeed();
