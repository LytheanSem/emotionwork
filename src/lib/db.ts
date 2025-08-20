import { Db, MongoClient } from "mongodb";

if (!process.env.DATABASE_URI) {
  throw new Error("Please add your Mongo URI to .env.local");
}

const uri = process.env.DATABASE_URI;
const options = {};

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

if (process.env.NODE_ENV === "development") {
  // In development mode, use a global variable so that the value
  // is preserved across module reloads caused by HMR (Hot Module Replacement).
  interface GlobalWithMongo {
    _mongoClientPromise?: Promise<MongoClient>;
  }

  const globalWithMongo = globalThis as GlobalWithMongo;

  if (!globalWithMongo._mongoClientPromise) {
    client = new MongoClient(uri, options);
    globalWithMongo._mongoClientPromise = client.connect();
  }
  clientPromise = globalWithMongo._mongoClientPromise;
} else {
  // In production mode, it's best to not use a global variable.
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

export default clientPromise;

// Database and collection references
export async function getDb(): Promise<Db> {
  const client = await clientPromise;
  return client.db();
}

// User model
export interface User {
  _id?: string;
  email: string;
  username: string;
  role: "user" | "admin";
  image?: string;
  provider: string;
  providerId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AdminUser {
  _id?: string;
  email: string;
  username: string;
  role: "admin";
  image?: string;
  provider: string;
  providerId?: string;
  permissions?: string[];
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface RegularUser {
  _id?: string;
  email: string;
  username: string;
  role: "user";
  image?: string;
  provider: string;
  providerId?: string;
  profile?: {
    firstName?: string;
    lastName?: string;
    phone?: string;
    department?: string;
  };
  preferences?: {
    notifications?: boolean;
    theme?: "light" | "dark";
  };
  createdAt: Date;
  updatedAt: Date;
}

// Category model
export interface Category {
  _id?: string;
  name: string;
  slug: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Equipment model
export interface Equipment {
  _id?: string;
  name: string;
  brand?: string;
  status: "available" | "in_use" | "maintenance";
  quantity: number;
  categoryId?: string;
  image?: string | File;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Media model
export interface Media {
  _id?: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  alt?: string;
  createdAt: Date;
  updatedAt: Date;
}
