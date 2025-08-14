// Simple MongoDB connection test with minimal options
import dotenv from "dotenv";
import { MongoClient } from "mongodb";

dotenv.config();

async function testConnection() {
  const uri = process.env.DATABASE_URI;

  if (!uri) {
    console.error("❌ DATABASE_URI not found");
    return;
  }

  console.log("🔍 Testing connection...");
  console.log(
    "📍 URI format:",
    uri.includes("mongodb+srv://") ? "Atlas" : "Local/Other"
  );

  // Minimal connection options
  const options = {
    serverSelectionTimeoutMS: 5000,
    connectTimeoutMS: 5000,
  };

  const client = new MongoClient(uri, options);

  try {
    console.log("🔄 Attempting to connect...");
    await client.connect();
    console.log("✅ Connected successfully!");

    const db = client.db();
    console.log("📚 Database:", db.databaseName);

    const collections = await db.listCollections().toArray();
    console.log("📋 Collections found:", collections.length);
  } catch (error) {
    console.error("❌ Connection failed:", error.message);

    if (
      error.message.includes("IP whitelist") ||
      error.message.includes("ECONNRESET")
    ) {
      console.log("\n🚨 IP WHITELIST ISSUE DETECTED!");
      console.log(
        "   Your IP address is not allowed to connect to MongoDB Atlas"
      );
      console.log(
        "   Solution: Go to MongoDB Atlas → Network Access → Add IP Address"
      );
      console.log(
        "   Or add: 0.0.0.0/0 (allows all IPs - less secure but good for dev)"
      );
    }
  } finally {
    await client.close();
  }
}

testConnection();
