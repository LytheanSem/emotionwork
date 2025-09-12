import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const DATABASE_URI = process.env.DATABASE_URI;

if (!DATABASE_URI) {
  console.error('DATABASE_URI environment variable is required');
  process.exit(1);
}

async function createTestDuplicates() {
  const client = new MongoClient(DATABASE_URI);
  
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db();
    
    console.log('\n🧪 Creating test duplicates...');
    
    // Create a test user that exists in multiple collections
    const testUser = {
      email: 'test-duplicate@example.com',
      username: 'testduplicate',
      role: 'user',
      createdAt: new Date(),
      isTestUser: true // Mark as test user for easy cleanup
    };
    
    // Insert into regularUsers
    const regularResult = await db.collection('regularUsers').insertOne({
      ...testUser,
      role: 'user',
      collection: 'regularUsers'
    });
    console.log(`✅ Created test user in regularUsers: ${regularResult.insertedId}`);
    
    // Insert into managerUsers (this creates a duplicate)
    const managerResult = await db.collection('managerUsers').insertOne({
      ...testUser,
      role: 'manager',
      collection: 'managerUsers'
    });
    console.log(`✅ Created test user in managerUsers: ${managerResult.insertedId}`);
    
    console.log('\n🎯 Test duplicates created successfully!');
    console.log('   Now run: bun scripts/safe-duplicate-cleanup.mjs scan');
    console.log('   This should detect the duplicate and mark the regularUsers entry for removal');
    
  } catch (error) {
    console.error('Error creating test duplicates:', error);
  } finally {
    await client.close();
    console.log('Disconnected from MongoDB');
  }
}

async function cleanupTestDuplicates() {
  const client = new MongoClient(DATABASE_URI);
  
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db();
    
    console.log('\n🧹 Cleaning up test duplicates...');
    
    // Remove test users from all collections
    const regularResult = await db.collection('regularUsers').deleteMany({ isTestUser: true });
    const managerResult = await db.collection('managerUsers').deleteMany({ isTestUser: true });
    const adminResult = await db.collection('adminUsers').deleteMany({ isTestUser: true });
    
    console.log(`✅ Removed ${regularResult.deletedCount} test users from regularUsers`);
    console.log(`✅ Removed ${managerResult.deletedCount} test users from managerUsers`);
    console.log(`✅ Removed ${adminResult.deletedCount} test users from adminUsers`);
    
    console.log('\n🎉 Test cleanup completed!');
    
  } catch (error) {
    console.error('Error cleaning up test duplicates:', error);
  } finally {
    await client.close();
    console.log('Disconnected from MongoDB');
  }
}

// Main function
async function main() {
  const command = process.argv[2];
  
  switch (command) {
    case 'create':
      console.log('🧪 Creating test duplicates...');
      await createTestDuplicates();
      break;
      
    case 'cleanup':
      console.log('🧹 Cleaning up test duplicates...');
      await cleanupTestDuplicates();
      break;
      
    default:
      console.log('Usage:');
      console.log('  bun scripts/test-duplicate-logic.mjs create  - Create test duplicates');
      console.log('  bun scripts/test-duplicate-logic.mjs cleanup - Remove test duplicates');
      console.log('');
      console.log('This script helps test the duplicate detection logic by:');
      console.log('1. Creating a test user in multiple collections');
      console.log('2. Allowing you to test the duplicate detection');
      console.log('3. Providing cleanup to remove test data');
      break;
  }
}

main().catch(console.error);
