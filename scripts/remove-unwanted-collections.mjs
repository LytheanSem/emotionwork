import { MongoClient } from "mongodb";

const uri = process.env.DATABASE_URI || "mongodb://localhost:27017/emotionwork";

async function removeUnwantedCollections() {
  let client;
  try {
    console.log("🗑️  Removing unwanted collections...");

    client = new MongoClient(uri);
    await client.connect();

    const db = client.db();

    // List of collections to remove
    const collectionsToRemove = [
      "users",
      "media",
      "payload-locked-document",
      "payload-locked-documents",
      "payload-migrations",
      "payload-preferences",
      "verification-codes",
    ];

    console.log("\n📋 Collections to remove:");
    collectionsToRemove.forEach((name) => console.log(`   - ${name}`));

    // Check which collections exist
    const existingCollections = await db.listCollections().toArray();
    const existingCollectionNames = existingCollections.map((col) => col.name);

    console.log("\n🔍 Checking existing collections...");

    for (const collectionName of collectionsToRemove) {
      if (existingCollectionNames.includes(collectionName)) {
        try {
          await db.collection(collectionName).drop();
          console.log(`   ✅ Dropped collection: ${collectionName}`);
        } catch (error) {
          console.log(`   ❌ Failed to drop ${collectionName}:`, error.message);
        }
      } else {
        console.log(`   ℹ️  Collection ${collectionName} doesn't exist`);
      }
    }

    // Show remaining collections
    const remainingCollections = await db.listCollections().toArray();
    console.log("\n📊 Remaining collections:");
    remainingCollections.forEach((col) => {
      console.log(`   - ${col.name}`);
    });

    console.log("\n🎉 Collection cleanup completed!");
  } catch (error) {
    console.error("❌ Error during cleanup:", error);
  } finally {
    if (client) {
      await client.close();
    }
  }
}

// Run the cleanup
removeUnwantedCollections();
