import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const DATABASE_URI = process.env.DATABASE_URI;

if (!DATABASE_URI) {
  console.error('DATABASE_URI environment variable is required');
  process.exit(1);
}

async function createComprehensiveTestDuplicates() {
  const client = new MongoClient(DATABASE_URI);
  
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db();
    
    console.log('\n🧪 Creating comprehensive test duplicates...');
    
    // Clean up any existing test data first
    await db.collection('adminUsers').deleteMany({ isTestUser: true });
    await db.collection('managerUsers').deleteMany({ isTestUser: true });
    await db.collection('regularUsers').deleteMany({ isTestUser: true });
    
    // Test Case 1: Duplicates across collections (adminUsers + regularUsers)
    console.log('\n📝 Test Case 1: Duplicates across collections');
    const adminUser1 = {
      email: 'admin-duplicate@example.com',
      username: 'admin1',
      role: 'admin',
      createdAt: new Date('2024-01-01'),
      isTestUser: true
    };
    const regularUser1 = {
      email: 'admin-duplicate@example.com',
      username: 'regular1-admin-dup',
      role: 'user',
      createdAt: new Date('2024-01-02'),
      isTestUser: true
    };
    
    await db.collection('adminUsers').insertOne(adminUser1);
    await db.collection('regularUsers').insertOne(regularUser1);
    console.log('✅ Created admin and regular user with same email');
    
    // Test Case 2: Duplicates across collections with missing roles
    console.log('\n📝 Test Case 2: Duplicates across collections with missing roles');
    const managerUser = {
      email: 'missing-role@example.com',
      username: 'manager1-missing-role',
      role: 'manager',
      createdAt: new Date('2024-01-01'),
      isTestUser: true
    };
    const regularUser = {
      email: 'missing-role@example.com',
      username: 'regular1-missing-role',
      // role: undefined (missing role)
      createdAt: new Date('2024-01-02'),
      isTestUser: true
    };
    
    await db.collection('managerUsers').insertOne(managerUser);
    await db.collection('regularUsers').insertOne(regularUser);
    console.log('✅ Created users across collections with missing role');
    
    // Test Case 3: Duplicates with incorrect roles across collections
    console.log('\n📝 Test Case 3: Duplicates with incorrect roles across collections');
    const incorrectRole1 = {
      email: 'incorrect-role@example.com',
      username: 'user1-incorrect-role',
      role: 'invalid_role',
      createdAt: new Date('2024-01-01'),
      isTestUser: true
    };
    const incorrectRole2 = {
      email: 'incorrect-role@example.com',
      username: 'user2-incorrect-role',
      role: 'another_invalid_role',
      createdAt: new Date('2024-01-02'),
      isTestUser: true
    };
    
    await db.collection('regularUsers').insertOne(incorrectRole1);
    await db.collection('managerUsers').insertOne(incorrectRole2);
    console.log('✅ Created users with incorrect roles across collections');
    
    // Test Case 4: Complex scenario - multiple duplicates across all collections
    console.log('\n📝 Test Case 4: Complex scenario across all collections');
    const complexUser1 = {
      email: 'complex@example.com',
      username: 'complex1-admin',
      role: 'admin',
      createdAt: new Date('2024-01-01'),
      isTestUser: true
    };
    const complexUser2 = {
      email: 'complex@example.com',
      username: 'complex2-user',
      role: 'user',
      createdAt: new Date('2024-01-02'),
      isTestUser: true
    };
    const complexUser3 = {
      email: 'complex@example.com',
      username: 'complex3-manager',
      role: 'manager',
      createdAt: new Date('2024-01-03'),
      isTestUser: true
    };
    
    await db.collection('adminUsers').insertOne(complexUser1);
    await db.collection('regularUsers').insertOne(complexUser2);
    await db.collection('managerUsers').insertOne(complexUser3);
    console.log('✅ Created complex scenario across all collections');
    
    console.log('\n🎯 Test duplicates created successfully!');
    console.log('   Now run: bun scripts/safe-duplicate-cleanup.mjs scan');
    console.log('   This should detect all types of duplicates:');
    console.log('   - Across collections with different roles');
    console.log('   - Missing roles (undefined role field)');
    console.log('   - Incorrect/invalid roles');
    console.log('   - Complex multi-collection scenarios');
    console.log('   - Role-based prioritization with fallbacks');
    
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
    const adminResult = await db.collection('adminUsers').deleteMany({ isTestUser: true });
    const managerResult = await db.collection('managerUsers').deleteMany({ isTestUser: true });
    const regularResult = await db.collection('regularUsers').deleteMany({ isTestUser: true });
    
    console.log(`✅ Removed ${adminResult.deletedCount} test users from adminUsers`);
    console.log(`✅ Removed ${managerResult.deletedCount} test users from managerUsers`);
    console.log(`✅ Removed ${regularResult.deletedCount} test users from regularUsers`);
    
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
      console.log('🧪 Creating comprehensive test duplicates...');
      await createComprehensiveTestDuplicates();
      break;
      
    case 'cleanup':
      console.log('🧹 Cleaning up test duplicates...');
      await cleanupTestDuplicates();
      break;
      
    default:
      console.log('Usage:');
      console.log('  bun scripts/test-comprehensive-duplicates.mjs create  - Create comprehensive test duplicates');
      console.log('  bun scripts/test-comprehensive-duplicates.mjs cleanup - Remove test duplicates');
      console.log('');
      console.log('This script creates various test scenarios:');
      console.log('1. Duplicates across collections with different roles');
      console.log('2. Duplicates across collections with missing roles');
      console.log('3. Duplicates with incorrect/invalid roles');
      console.log('4. Complex multi-collection duplicate scenarios');
      console.log('');
      console.log('Use this to test the improved duplicate detection logic.');
      break;
  }
}

main().catch(console.error);
