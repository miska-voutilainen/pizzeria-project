import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.development' });

const DB_CONFIG = {
  uri: process.env.MONGO_URI || '',
  dbName: process.env.DB_NAME || '',
  options: {
    maxPoolSize: 10,
    minPoolSize: 2,
    maxIdleTimeMS: 10000,
    serverSelectionTimeoutMS: 5000,
  },
  maxRetries: 3,
  retryDelay: 1000,
};

let client = null;
let db = null;

async function connectMongoDB() {
  if (db) {
    console.log('Reusing existing MongoDB connection');
    return db;
  }

  if (!DB_CONFIG.uri) {
    throw new Error('MONGO_URI is not defined in .env file');
  }

  let retries = 0;
  while (retries < DB_CONFIG.maxRetries) {
    try {
      client = new MongoClient(DB_CONFIG.uri, DB_CONFIG.options);
      await client.connect();
      console.log('Successfully connected to MongoDB');

      db = client.db(DB_CONFIG.dbName);

      client.on('error', (err) => {
        console.error('MongoDB connection error:', err);
        db = null;
      });

      client.on('close', () => {
        console.log('MongoDB connection closed unexpectedly');
        db = null;
      });

      return db;
    } catch (error) {
      console.error(`Connection attempt ${retries + 1} failed:`, error.message);
      retries++;
      if (retries >= DB_CONFIG.maxRetries) {
        throw new Error(`Failed to connect to MongoDB after ${DB_CONFIG.maxRetries} attempts`);
      }
      await new Promise((resolve) => setTimeout(resolve, DB_CONFIG.retryDelay));
    }
  }
}

async function closeMongoDB() {
  if (client) {
    try {
      await client.close();
      console.log('MongoDB connection closed');
    } catch (error) {
      console.error('Error closing MongoDB connection:', error);
    } finally {
      client = null;
      db = null;
    }
  }
}

function getMongoDB() {
  if (!db) {
    throw new Error('MongoDB not connected. Call connectMongoDB first.');
  }
  return db;
}

function isMongoConnected() {
  return !!db && !!client;
}

export { connectMongoDB, closeMongoDB, getMongoDB, isMongoConnected };