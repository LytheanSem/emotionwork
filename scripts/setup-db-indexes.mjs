import { MongoClient } from "mongodb";

const uri = process.env.DATABASE_URI || "mongodb://localhost:27017/emotionwork";

async function setupDatabaseIndexes() {
  let client;
  try {
    console.log("🔧 Setting up database indexes...");

    client = new MongoClient(uri);
    await client.connect();

    const db = client.db();

    // Users collection indexes
    console.log("\n👥 Setting up Users collection indexes...");
    const usersCollection = db.collection("users");

    try {
      // Create unique index on email
      await usersCollection.createIndex({ email: 1 }, { unique: true });
      console.log("   ✅ Created unique index on email");
    } catch (error) {
      if (error.code === 86) {
        console.log("   ℹ️  Email index already exists");
      } else {
        console.log("   ❌ Error creating email index:", error.message);
      }
    }

    try {
      // Create unique index on username
      await usersCollection.createIndex({ username: 1 }, { unique: true });
      console.log("   ✅ Created unique index on username");
    } catch (error) {
      if (error.code === 86) {
        console.log("   ℹ️  Username index already exists");
      } else {
        console.log("   ❌ Error creating username index:", error.message);
      }
    }

    try {
      // Create index on providerId for OAuth
      await usersCollection.createIndex({ providerId: 1 });
      console.log("   ✅ Created index on providerId");
    } catch (error) {
      if (error.code === 86) {
        console.log("   ℹ️  ProviderId index already exists");
      } else {
        console.log("   ❌ Error creating providerId index:", error.message);
      }
    }

    try {
      // Create index on role for admin queries
      await usersCollection.createIndex({ role: 1 });
      console.log("   ✅ Created index on role");
    } catch (error) {
      if (error.code === 86) {
        console.log("   ℹ️  Role index already exists");
      } else {
        console.log("   ❌ Error creating role index:", error.message);
      }
    }

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

    // Media collection indexes
    console.log("\n🖼️  Setting up Media collection indexes...");
    const mediaCollection = db.collection("media");

    try {
      // Create unique index on filename
      await mediaCollection.createIndex({ filename: 1 }, { unique: true });
      console.log("   ✅ Created unique index on filename");
    } catch (error) {
      if (error.code === 86) {
        console.log("   ℹ️  Filename index already exists");
      } else {
        console.log("   ❌ Error creating filename index:", error.message);
      }
    }

    try {
      // Create index on originalName for search
      await mediaCollection.createIndex({ originalName: 1 });
      console.log("   ✅ Created index on originalName");
    } catch (error) {
      if (error.code === 86) {
        console.log("   ℹ️  OriginalName index already exists");
      } else {
        console.log("   ❌ Error creating originalName index:", error.message);
      }
    }

    console.log("\n🎉 Database indexes setup completed!");

    // Show all indexes
    console.log("\n📊 Current indexes:");
    const collections = ["users", "categories", "equipment", "media"];

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
