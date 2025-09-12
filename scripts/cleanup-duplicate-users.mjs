import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const DATABASE_URI = process.env.DATABASE_URI;

if (!DATABASE_URI) {
  console.error('DATABASE_URI environment variable is required');
  console.error('Please check your .env file or environment variables');
  process.exit(1);
}

async function cleanupDuplicateUsers() {
  console.log('⚠️  WARNING: This script has been deprecated due to safety concerns.');
  console.log('   It may delete legitimate users that aren\'t actually duplicates.');
  console.log('');
  console.log('✅ Please use the safer alternative:');
  console.log('   bun scripts/safe-duplicate-cleanup.mjs scan    - Scan for duplicates');
  console.log('   bun scripts/safe-duplicate-cleanup.mjs cleanup - Remove only tracked duplicates');
  console.log('');
  console.log('📖 See DUPLICATE_CLEANUP_GUIDE.md for detailed instructions');
  console.log('');
  console.log('❌ This script will NOT run to prevent accidental data loss.');
  process.exit(1);
  
  const client = new MongoClient(DATABASE_URI);
  
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db();
    
    // Find users that exist in multiple collections
    console.log('\n🔍 Checking for duplicate users...');
    
    const adminUsers = await db.collection('adminUsers').find({}).toArray();
    const managerUsers = await db.collection('managerUsers').find({}).toArray();
    const regularUsers = await db.collection('regularUsers').find({}).toArray();
    
    console.log(`Found ${adminUsers.length} admin users`);
    console.log(`Found ${managerUsers.length} manager users`);
    console.log(`Found ${regularUsers.length} regular users`);
    
    // Create a map of email -> user info
    const emailMap = new Map();
    
    // Check admin users
    adminUsers.forEach(user => {
      if (emailMap.has(user.email)) {
        console.log(`⚠️  Duplicate found: ${user.email} exists in adminUsers and ${emailMap.get(user.email).collection}`);
      } else {
        emailMap.set(user.email, { ...user, collection: 'adminUsers' });
      }
    });
    
    // Check manager users
    managerUsers.forEach(user => {
      if (emailMap.has(user.email)) {
        console.log(`⚠️  Duplicate found: ${user.email} exists in ${emailMap.get(user.email).collection} and managerUsers`);
        // Keep the higher priority role (admin > manager > user)
        const existing = emailMap.get(user.email);
        if (existing.role === 'admin') {
          console.log(`🗑️  Removing duplicate from managerUsers: ${user.email}`);
          // Remove from managerUsers since admin takes priority
        } else {
          // Replace with manager role
          emailMap.set(user.email, { ...user, collection: 'managerUsers' });
          console.log(`🔄 Updating ${user.email} to manager role`);
        }
      } else {
        emailMap.set(user.email, { ...user, collection: 'managerUsers' });
      }
    });
    
    // Check regular users
    regularUsers.forEach(user => {
      if (emailMap.has(user.email)) {
        console.log(`⚠️  Duplicate found: ${user.email} exists in ${emailMap.get(user.email).collection} and regularUsers`);
        // Keep the higher priority role
        const existing = emailMap.get(user.email);
        if (existing.role === 'admin' || existing.role === 'manager') {
          console.log(`🗑️  Removing duplicate from regularUsers: ${user.email}`);
          // Remove from regularUsers since higher role takes priority
        } else {
          // Replace with regular user role
          emailMap.set(user.email, { ...user, collection: 'regularUsers' });
        }
      } else {
        emailMap.set(user.email, { ...user, collection: 'regularUsers' });
      }
    });
    
    console.log('\n🧹 Starting cleanup...');
    
    // Clean up duplicates based on priority
    for (const [email, userInfo] of emailMap) {
      const { collection, role } = userInfo;
      
      if (role === 'admin') {
        // Remove from other collections
        await db.collection('managerUsers').deleteMany({ email });
        await db.collection('regularUsers').deleteMany({ email });
        console.log(`✅ Kept ${email} in adminUsers, removed from other collections`);
      } else if (role === 'manager') {
        // Remove from regularUsers
        await db.collection('regularUsers').deleteMany({ email });
        console.log(`✅ Kept ${email} in managerUsers, removed from regularUsers`);
      }
      // regular users stay as is
    }
    
    console.log('\n🎉 Cleanup completed!');
    
    // Show final counts
    const finalAdminUsers = await db.collection('adminUsers').find({}).toArray();
    const finalManagerUsers = await db.collection('managerUsers').find({}).toArray();
    const finalRegularUsers = await db.collection('regularUsers').find({}).toArray();
    
    console.log(`\n📊 Final user counts:`);
    console.log(`Admin users: ${finalAdminUsers.length}`);
    console.log(`Manager users: ${finalManagerUsers.length}`);
    console.log(`Regular users: ${finalRegularUsers.length}`);
    
  } catch (error) {
    console.error('Error during cleanup:', error);
  } finally {
    await client.close();
    console.log('Disconnected from MongoDB');
  }
}

// Run the cleanup
cleanupDuplicateUsers().catch(console.error);
