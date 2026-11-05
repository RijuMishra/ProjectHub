const mongoose = require('mongoose');

let isConnected = false;

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/projecthub';

  console.log(`[Database] Attempting connection to MongoDB at: ${uri.replace(/\/\/.*@/, '//<credentials>@')}`);

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 2500,
    });
    isConnected = true;
    console.log(`[Database] MongoDB Atlas/Local Connected successfully: ${conn.connection.host}`);
    return conn;
  } catch (err) {
    isConnected = false;
    console.warn(`[Database] Primary MongoDB connection failed: ${err.message}`);
    console.log('[Database] Activating ProjectHub Resilient Local Storage Engine (Full Mongoose ODM compatibility fallback).');
    console.log('[Database] Real CRUD, queries, password hashing, and data persistence active in `server/data/localStore.json`.');
    console.log('\n================================================================');
    console.log(' [MONGODB ATLAS CONFIGURATION NOTICE]');
    console.log(' To connect to cloud MongoDB Atlas:');
    console.log(' 1. Create a free database on https://www.mongodb.com/cloud/atlas');
    console.log(' 2. Paste your connection URI in `server/.env`:');
    console.log('    MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/projecthub');
    console.log(' 3. Restart server.');
    console.log('================================================================\n');
    return null;
  }
};

const getIsConnected = () => isConnected;

module.exports = { connectDB, getIsConnected };
