import { MongoClient } from "mongodb";

const uri = process.env.DATABASE_URI || "mongodb://localhost:27017/emotionwork";

async function removeOldCategories() {
  let client;
  try {
    console.log("🗑️ Removing old categories...");

    client = new MongoClient(uri);
    await client.connect();

    const db = client.db();
    const categoriesCollection = db.collection("categories");

    // Find and remove old categories
    const oldCategories = await categoriesCollection.find({
      $or: [
        { name: "Consoles" },
        { name: "Structures" },
        { name: "Lights" },
        { slug: "consoles" },
        { slug: "structures" },
        { slug: "lights" }
      ]
    }).toArray();

    console.log(`\n📋 Found ${oldCategories.length} old categories to remove:`);
    oldCategories.forEach((cat, index) => {
      console.log(`   ${index + 1}. ${cat.name} (${cat.slug}) - ID: ${cat._id}`);
    });

    if (oldCategories.length > 0) {
      // Remove old categories
      const result = await categoriesCollection.deleteMany({
        $or: [
          { name: "Consoles" },
          { name: "Structures" },
          { name: "Lights" },
          { slug: "consoles" },
          { slug: "structures" },
          { slug: "lights" }
        ]
      });

      console.log(`\n✅ Removed ${result.deletedCount} old categories`);

      // Show remaining categories
      const remainingCategories = await categoriesCollection.find({}).sort({ name: 1 }).toArray();
      console.log("\n📋 Remaining categories:");
      remainingCategories.forEach((cat, index) => {
        console.log(`   ${index + 1}. ${cat.name} (${cat.slug}) - ID: ${cat._id}`);
      });
    } else {
      console.log("\n✅ No old categories found to remove");
    }

  } catch (error) {
    console.error("❌ Error removing old categories:", error);
  } finally {
    if (client) {
      await client.close();
    }
  }
}

// Run the cleanup
removeOldCategories();
