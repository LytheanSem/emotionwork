import { MongoClient } from 'mongodb';

async function investigateDatabase() {
  // Try different possible database URIs
  const possibleUris = [
    'mongodb://localhost:27017/emotionwork',
    'mongodb://localhost:27017/emotionwork-dev',
    'mongodb://127.0.0.1:27017/emotionwork',
    'mongodb://127.0.0.1:27017/emotionwork-dev'
  ];

  for (const uri of possibleUris) {
    console.log(`\n🔍 Trying to connect to: ${uri}`);
    
    try {
      const client = new MongoClient(uri);
      await client.connect();
      console.log(`✅ Connected to: ${uri}`);
      
      const db = client.db();
      const dbName = db.databaseName;
      console.log(`📊 Database name: ${dbName}`);
      
      // List all collections
      const collections = await db.listCollections().toArray();
      console.log(`📁 Collections found: ${collections.map(c => c.name).join(', ')}`);
      
      // Check each collection for data
      for (const collection of collections) {
        const count = await db.collection(collection.name).countDocuments();
        console.log(`  - ${collection.name}: ${count} documents`);
        
        if (count > 0) {
          // Show first few documents
          const sample = await db.collection(collection.name).find({}).limit(3).toArray();
          console.log(`    Sample data:`, sample.map(doc => ({
            _id: doc._id,
            email: doc.email,
            username: doc.username,
            role: doc.role
          })));
        }
      }
      
      await client.close();
      console.log(`✅ Disconnected from: ${uri}`);
      
      // If we found data, stop here
      if (collections.some(c => c.name.includes('user') || c.name.includes('User'))) {
        console.log(`\n🎯 Found user data in: ${uri}`);
        break;
      }
      
    } catch (error) {
      console.log(`❌ Failed to connect to: ${uri}`);
      console.log(`   Error: ${error.message}`);
    }
  }
}

investigateDatabase().catch(console.error);








