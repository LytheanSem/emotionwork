import { MongoClient } from "mongodb";

const uri = process.env.DATABASE_URI || "mongodb://localhost:27017/emotionwork";

async function setupDatabaseIndexes() {
  let client;
  try {
    console.log("🔧 Setting up database indexes...");

    client = new MongoClient(uri);
    await client.connect();

    const db = client.db();

    // Users collection indexes - REMOVED (using adminUsers and regularUsers instead)
    console.log("\n👥 Users collection indexes skipped (using adminUsers and regularUsers)");

    // Categories collection indexes
    console.log("\n📂 Setting up Categories collection indexes...");
    const categoriesCollection = db.collection("categories");

    try {
      // Create unique index on slug
      await categoriesCollection.createIndex({ slug: 1 }, { unique: true });
      console.log("   ✅ Created unique index on slug");
    } catch (error) {
      if (error.code === 86) {
        console.log("   ℹ️  Slug index already exists");
      } else {
        console.log("   ❌ Error creating slug index:", error.message);
      }
    }

    try {
      // Create index on name for search
      await categoriesCollection.createIndex({ name: 1 });
      console.log("   ✅ Created index on name");
    } catch (error) {
      if (error.code === 86) {
        console.log("   ℹ️  Name index already exists");
      } else {
        console.log("   ❌ Error creating name index:", error.message);
      }
    }

    // Equipment collection indexes
    console.log("\n🔧 Setting up Equipment collection indexes...");
    const equipmentCollection = db.collection("equipment");

    try {
      // Create index on name for search
      await equipmentCollection.createIndex({ name: 1 });
      console.log("   ✅ Created index on name");
    } catch (error) {
      if (error.code === 86) {
        console.log("   ℹ️  Name index already exists");
      } else {
        console.log("   ❌ Error creating name index:", error.message);
      }
    }

    try {
      // Create index on categoryId for relationships
      await equipmentCollection.createIndex({ categoryId: 1 });
      console.log("   ✅ Created index on categoryId");
    } catch (error) {
      if (error.code === 86) {
        console.log("   ℹ️  CategoryId index already exists");
      } else {
        console.log("   ❌ Error creating categoryId index:", error.message);
      }
    }

    try {
      // Create index on status for filtering
      await equipmentCollection.createIndex({ status: 1 });
      console.log("   ✅ Created index on status");
    } catch (error) {
      if (error.code === 86) {
        console.log("   ℹ️  Status index already exists");
      } else {
        console.log("   ❌ Error creating status index:", error.message);
      }
    }

    // Media collection indexes - REMOVED (not needed)
    console.log("\n🖼️  Media collection indexes skipped (not needed)");

    console.log("\n🎉 Database indexes setup completed!");

    // Show all indexes
    console.log("\n📊 Current indexes:");
    const collections = ["categories", "equipment"];

    for (const collectionName of collections) {
      const collection = db.collection(collectionName);
      const indexes = await collection.indexes();
      console.log(`\n${collectionName}:`);
      indexes.forEach((index) => {
        const keys = Object.keys(index.key).join(", ");
        const unique = index.unique ? " (unique)" : "";
        console.log(`   - ${keys}${unique}`);
      });
    }
  } catch (error) {
    console.error("❌ Error setting up indexes:", error);
  } finally {
    if (client) {
      await client.close();
    }
  }
}

// Run the setup
setupDatabaseIndexes();
