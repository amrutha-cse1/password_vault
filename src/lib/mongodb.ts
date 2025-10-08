import { MongoClient } from 'mongodb';
import { inMemoryDB } from './inMemoryDB';

// Check if MongoDB URI is available
const uri = process.env.MONGODB_URI;
const options = {};

let client: MongoClient;
let clientPromise: Promise<MongoClient> | null = null;
let useInMemoryDB = false;

// Try to connect to MongoDB, fallback to in-memory DB if unavailable
if (uri) {
  if (process.env.NODE_ENV === 'development') {
    let globalWithMongo = global as typeof globalThis & {
      _mongoClientPromise?: Promise<MongoClient>;
    };

    if (!globalWithMongo._mongoClientPromise) {
      client = new MongoClient(uri, options);
      globalWithMongo._mongoClientPromise = client.connect().catch((error) => {
        console.warn('MongoDB connection failed, using in-memory database:', error.message);
        useInMemoryDB = true;
        return null as any;
      });
    }
    clientPromise = globalWithMongo._mongoClientPromise;
  } else {
    client = new MongoClient(uri, options);
    clientPromise = client.connect().catch((error) => {
      console.warn('MongoDB connection failed, using in-memory database:', error.message);
      useInMemoryDB = true;
      return null as any;
    });
  }
} else {
  console.warn('MongoDB URI not found, using in-memory database');
  useInMemoryDB = true;
}

// Create a wrapper that handles both MongoDB and in-memory DB
export const getDatabase = async () => {
  if (useInMemoryDB || !clientPromise) {
    return {
      isInMemory: true,
      db: inMemoryDB,
    };
  }

  try {
    const mongoClient = await clientPromise;
    if (!mongoClient) {
      useInMemoryDB = true;
      return {
        isInMemory: true,
        db: inMemoryDB,
      };
    }
    
    return {
      isInMemory: false,
      db: mongoClient.db('password-vault'),
    };
  } catch (error) {
    console.warn('Failed to connect to MongoDB, using in-memory database:', error);
    useInMemoryDB = true;
    return {
      isInMemory: true,
      db: inMemoryDB,
    };
  }
};

export default clientPromise;