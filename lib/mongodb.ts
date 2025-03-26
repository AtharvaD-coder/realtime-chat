import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI!;

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

// Declare a global variable for the client connection promise (used only in development)
declare global {
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

if (!process.env.MONGODB_URI) {
  throw new Error('Please add your MongoDB URI to .env.local');
}

if (process.env.NODE_ENV === 'development') {

  if (!global._mongoClientPromise) {
    client = new MongoClient(uri); 
    global._mongoClientPromise = client.connect(); // Store the connection promise in the global variable
  }
  clientPromise = global._mongoClientPromise; // Use the existing connection promise if it's already set
} else {
  // In production, create a new connection directly
  client = new MongoClient(uri);
  clientPromise = client.connect(); // Immediately connect and store the promise
}

export async function connectToDatabase() {
  const client = await clientPromise; 
  const db = client.db('realtimechat'); 
  return { client, db }; 
}