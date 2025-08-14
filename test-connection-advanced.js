// Advanced MongoDB Atlas connection test with multiple fallback options
import dotenv from "dotenv";
import { MongoClient } from "mongodb";

dotenv.config();

async function testConnectionWithOptions() {
  const uri = process.env.DATABASE_URI;

  if (!uri) {
    console.error("❌ DATABASE_URI not found");
    return;
  }

  console.log("🔍 Testing MongoDB Atlas connection with different options...");
  console.log(
    "📍 URI format:",
    uri.includes("mongodb+srv://") ? "Atlas" : "Local/Other"
  );

  // Test different connection configurations
  const connectionConfigs = [
    {
      name: "Standard Atlas (TLS)",
      options: {
        serverSelectionTimeoutMS: 10000,
        connectTimeoutMS: 10000,
        ssl: true,
        tls: true,
      },
    },
    {
      name: "Atlas with relaxed TLS",
      options: {
        serverSelectionTimeoutMS: 10000,
        connectTimeoutMS: 10000,
        ssl: true,
        tls: true,
        tlsAllowInvalidCertificates: true,
        tlsAllowInvalidHostnames: true,
      },
    },
    {
      name: "Minimal options",
      options: {
        serverSelectionTimeoutMS: 5000,
        connectTimeoutMS: 5000,
      },
    },
  ];

  for (const config of connectionConfigs) {
    console.log(`\n🔄 Testing: ${config.name}`);

    const client = new MongoClient(uri, config.options);

    try {
      await client.connect();
      console.log(`✅ ${config.name}: SUCCESS!`);

      const db = client.db();
      console.log(`📚 Database: ${db.databaseName}`);

      const collections = await db.listCollections().toArray();
      console.log(`📋 Collections found: ${collections.length}`);

      if (collections.length > 0) {
        console.log("📋 Collection names:");
        collections.forEach((col) => console.log(`   - ${col.name}`));
      }

      await client.close();
      console.log("🎉 Connection successful! Your MongoDB Atlas is working.");
      return; // Exit on success
    } catch (error) {
      console.log(`❌ ${config.name}: ${error.message}`);

      if (error.message.includes("ECONNRESET")) {
        console.log(
          "   💡 Connection reset - cluster might be rejecting connections"
        );
      } else if (error.message.includes("authentication")) {
        console.log("   💡 Authentication failed - check username/password");
      } else if (error.message.includes("ENOTFOUND")) {
        console.log("   💡 DNS resolution failed - check cluster hostname");
      }

      await client.close();
    }
  }

  // If all configs failed, provide troubleshooting steps
  console.log("\n🚨 All connection attempts failed. Troubleshooting steps:");
  console.log("1. Check MongoDB Atlas dashboard - is your cluster running?");
  console.log("2. Verify cluster status is 'Active' (not paused/stopped)");
  console.log("3. Check if cluster is in maintenance mode");
  console.log("4. Verify username/password in your connection string");
  console.log("5. Try connecting from MongoDB Compass to isolate the issue");
  console.log(
    "6. Check if your cluster has any IP restrictions beyond the whitelist"
  );
}

testConnectionWithOptions();
