import { MongoClient } from "mongodb";

const uri = process.env.DATABASE_URI || "mongodb://localhost:27017/emotionwork";

async function debugCategories() {
  let client;
  try {
    console.log("🔍 Debugging categories...");

    client = new MongoClient(uri);
    await client.connect();

    const db = client.db();
    const categoriesCollection = db.collection("categories");
    const equipmentCollection = db.collection("equipment");

    // Get all categories
    const categories = await categoriesCollection.find({}).sort({ name: 1 }).toArray();
    
    console.log("\n📋 All categories in database:");
    categories.forEach((cat, index) => {
      console.log(`   ${index + 1}. ${cat.name} (${cat.slug}) - ID: ${cat._id}`);
    });

    // Get all equipment and their category references
    const equipment = await equipmentCollection.find({}).toArray();
    
    console.log("\n🔧 Equipment and their categories:");
    equipment.forEach((eq, index) => {
      const category = categories.find(cat => cat._id.toString() === eq.categoryId?.toString());
      console.log(`   ${index + 1}. ${eq.name} - Category: ${category?.name || 'No category'} (ID: ${eq.categoryId})`);
    });

    // Test the API endpoint directly
    console.log("\n🌐 Testing API endpoint...");
    const response = await fetch("http://localhost:3000/api/equipment-data");
    if (response.ok) {
      const data = await response.json();
      console.log("   API Response Categories:");
      data.categories?.forEach((cat, index) => {
        console.log(`   ${index + 1}. ${cat.name} (${cat.slug}) - ID: ${cat.id}`);
      });
    } else {
      console.log("   ❌ API request failed:", response.status);
    }

  } catch (error) {
    console.error("❌ Error debugging categories:", error);
  } finally {
    if (client) {
      await client.close();
    }
  }
}

// Run the debug
debugCategories();
