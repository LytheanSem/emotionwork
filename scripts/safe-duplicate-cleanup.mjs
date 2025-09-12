import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

// Load environment variables
dotenv.config();

const DATABASE_URI = process.env.DATABASE_URI;

if (!DATABASE_URI) {
  console.error('DATABASE_URI environment variable is required');
  console.error('Please check your .env file or environment variables');
  process.exit(1);
}

// File to store duplicate tracking data
const DUPLICATES_FILE = path.join(process.cwd(), 'duplicate-users.json');

async function scanForDuplicates() {
  const client = new MongoClient(DATABASE_URI);
  
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db();
    
    console.log('\n🔍 Scanning for duplicate users...');
    
    // Get all users from all collections
    const adminUsers = await db.collection('adminUsers').find({}).toArray();
    const managerUsers = await db.collection('managerUsers').find({}).toArray();
    const regularUsers = await db.collection('regularUsers').find({}).toArray();
    
    console.log(`Found ${adminUsers.length} admin users`);
    console.log(`Found ${managerUsers.length} manager users`);
    console.log(`Found ${regularUsers.length} regular users`);
    
    // Track duplicates with detailed information
    const duplicates = new Map();
    const allUsers = [
      ...adminUsers.map(u => ({ ...u, collection: 'adminUsers' })),
      ...managerUsers.map(u => ({ ...u, collection: 'managerUsers' })),
      ...regularUsers.map(u => ({ ...u, collection: 'regularUsers' }))
    ];
    
    // Group users by email
    const emailGroups = new Map();
    allUsers.forEach(user => {
      if (!emailGroups.has(user.email)) {
        emailGroups.set(user.email, []);
      }
      emailGroups.get(user.email).push(user);
    });
    
    // Identify actual duplicates (users with same email - within or across collections)
    for (const [email, users] of emailGroups) {
      if (users.length > 1) {
        // Enhanced sorting logic with fallbacks for missing/incorrect roles
        users.sort((a, b) => {
          // First, try role-based priority
          const rolePriority = { admin: 3, manager: 2, user: 1 };
          const aRolePriority = rolePriority[a.role] || 0; // Default to 0 for missing/unknown roles
          const bRolePriority = rolePriority[b.role] || 0;
          
          if (aRolePriority !== bRolePriority) {
            return bRolePriority - aRolePriority; // Higher priority first
          }
          
          // If roles are equal or both missing, prioritize by collection
          const collectionPriority = { adminUsers: 3, managerUsers: 2, regularUsers: 1 };
          const aCollectionPriority = collectionPriority[a.collection] || 0;
          const bCollectionPriority = collectionPriority[b.collection] || 0;
          
          if (aCollectionPriority !== bCollectionPriority) {
            return bCollectionPriority - aCollectionPriority;
          }
          
          // If still equal, prioritize by creation date (newer first)
          const aDate = new Date(a.createdAt || a._id.getTimestamp());
          const bDate = new Date(b.createdAt || b._id.getTimestamp());
          return bDate - aDate;
        });
        
        const keepUser = users[0];
        const duplicatesToRemove = users.slice(1);
        
        // Determine the reason for keeping this user
        let reason;
        const rolePriority = { admin: 3, manager: 2, user: 1 };
        const collectionPriority = { adminUsers: 3, managerUsers: 2, regularUsers: 1 };
        
        if (keepUser.role && rolePriority[keepUser.role]) {
          reason = `User exists in ${users.length} instances, keeping highest priority role: ${keepUser.role}`;
        } else if (keepUser.collection && collectionPriority[keepUser.collection]) {
          reason = `User exists in ${users.length} instances, keeping highest priority collection: ${keepUser.collection}`;
        } else {
          reason = `User exists in ${users.length} instances, keeping most recent entry`;
        }
        
        // Track the specific documents that will be removed
        duplicates.set(email, {
          keep: {
            _id: keepUser._id,
            email: keepUser.email,
            role: keepUser.role || 'unknown',
            collection: keepUser.collection,
            username: keepUser.username,
            createdAt: keepUser.createdAt
          },
          remove: duplicatesToRemove.map(dup => ({
            _id: dup._id,
            email: dup.email,
            role: dup.role || 'unknown',
            collection: dup.collection,
            username: dup.username,
            createdAt: dup.createdAt
          })),
          reason: reason,
          totalFound: users.length,
          duplicateTypes: {
            withinCollections: users.filter(u => u.collection === keepUser.collection).length - 1,
            acrossCollections: users.filter(u => u.collection !== keepUser.collection).length
          }
        });
        
        console.log(`⚠️  Duplicate found: ${email} (${users.length} instances)`);
        console.log(`   ✅ Keeping: ${keepUser.collection} (${keepUser.role || 'unknown role'}) - ID: ${keepUser._id}`);
        
        // Show detailed breakdown of what will be removed
        const withinCollection = duplicatesToRemove.filter(dup => dup.collection === keepUser.collection);
        const acrossCollections = duplicatesToRemove.filter(dup => dup.collection !== keepUser.collection);
        
        if (withinCollection.length > 0) {
          console.log(`   🗑️  Within ${keepUser.collection}: ${withinCollection.length} duplicates`);
          withinCollection.forEach(dup => {
            console.log(`      - ID: ${dup._id} (${dup.role || 'unknown role'})`);
          });
        }
        
        if (acrossCollections.length > 0) {
          console.log(`   🗑️  Across other collections: ${acrossCollections.length} duplicates`);
          acrossCollections.forEach(dup => {
            console.log(`      - ${dup.collection}: ID ${dup._id} (${dup.role || 'unknown role'})`);
          });
        }
      }
    }
    
    // Save duplicates to file for review
    const duplicatesData = {
      timestamp: new Date().toISOString(),
      totalDuplicates: duplicates.size,
      duplicates: Object.fromEntries(duplicates)
    };
    
    fs.writeFileSync(DUPLICATES_FILE, JSON.stringify(duplicatesData, null, 2));
    console.log(`\n📄 Duplicate information saved to: ${DUPLICATES_FILE}`);
    console.log(`📊 Found ${duplicates.size} users with duplicates`);
    
    // Show summary of what will be removed
    if (duplicates.size > 0) {
      console.log(`\n📋 Summary of duplicates found:`);
      let totalToRemove = 0;
      let withinCollectionDuplicates = 0;
      let acrossCollectionDuplicates = 0;
      
      for (const [email, data] of duplicates) {
        console.log(`   ${email}: Keep 1, Remove ${data.remove.length} (${data.totalFound} total)`);
        console.log(`      - Within collection: ${data.duplicateTypes.withinCollections}`);
        console.log(`      - Across collections: ${data.duplicateTypes.acrossCollections}`);
        totalToRemove += data.remove.length;
        withinCollectionDuplicates += data.duplicateTypes.withinCollections;
        acrossCollectionDuplicates += data.duplicateTypes.acrossCollections;
      }
      
      console.log(`\n🎯 Total documents marked for removal: ${totalToRemove}`);
      console.log(`   - Within same collection: ${withinCollectionDuplicates}`);
      console.log(`   - Across different collections: ${acrossCollectionDuplicates}`);
    } else {
      console.log(`\n✅ No duplicates found - all users are unique across and within collections`);
    }
    
    return duplicates;
    
  } catch (error) {
    console.error('Error during duplicate scanning:', error);
    throw error;
  } finally {
    await client.close();
    console.log('Disconnected from MongoDB');
  }
}

async function cleanupTrackedDuplicates() {
  // Check if duplicates file exists
  if (!fs.existsSync(DUPLICATES_FILE)) {
    console.error(`❌ Duplicates file not found: ${DUPLICATES_FILE}`);
    console.error('Please run the scan phase first to identify duplicates.');
    process.exit(1);
  }
  
  // Load duplicates data
  const duplicatesData = JSON.parse(fs.readFileSync(DUPLICATES_FILE, 'utf8'));
  const duplicates = new Map(Object.entries(duplicatesData.duplicates));
  
  console.log(`\n📄 Loaded ${duplicates.size} tracked duplicates from ${DUPLICATES_FILE}`);
  console.log(`📅 Scan timestamp: ${duplicatesData.timestamp}`);
  
  // Ask for confirmation
  console.log('\n⚠️  WARNING: This will permanently delete the following users:');
  for (const [email, data] of duplicates) {
    console.log(`\n📧 ${email}:`);
    console.log(`   ✅ Keeping: ${data.keep.collection} (${data.keep.role})`);
    data.remove.forEach(dup => {
      console.log(`   🗑️  Removing: ${dup.collection} (${dup.role}) - ID: ${dup._id}`);
    });
    console.log(`   📝 Reason: ${data.reason}`);
  }
  
  // In a real scenario, you might want to add a confirmation prompt here
  // For now, we'll add a safety check
  console.log('\n🔒 Safety check: This script will only remove the EXACT duplicates identified during scanning.');
  console.log('   It will NOT remove any users that weren\'t specifically marked as duplicates.');
  
  const client = new MongoClient(DATABASE_URI);
  
  try {
    await client.connect();
    console.log('\n🧹 Starting safe cleanup...');
    
    const db = client.db();
    let totalRemoved = 0;
    
    for (const [email, data] of duplicates) {
      console.log(`\n🔧 Processing ${email}...`);
      
      // Remove only the specific duplicates that were identified
      for (const duplicateToRemove of data.remove) {
        const result = await db.collection(duplicateToRemove.collection).deleteOne({
          _id: duplicateToRemove._id
        });
        
        if (result.deletedCount === 1) {
          console.log(`   ✅ Removed ${email} from ${duplicateToRemove.collection} (ID: ${duplicateToRemove._id})`);
          totalRemoved++;
        } else {
          console.log(`   ⚠️  User ${email} not found in ${duplicateToRemove.collection} (ID: ${duplicateToRemove._id}) - may have been already removed`);
        }
      }
    }
    
    console.log(`\n🎉 Cleanup completed! Removed ${totalRemoved} duplicate users.`);
    
    // Show final counts
    const finalAdminUsers = await db.collection('adminUsers').countDocuments();
    const finalManagerUsers = await db.collection('managerUsers').countDocuments();
    const finalRegularUsers = await db.collection('regularUsers').countDocuments();
    
    console.log(`\n📊 Final user counts:`);
    console.log(`Admin users: ${finalAdminUsers}`);
    console.log(`Manager users: ${finalManagerUsers}`);
    console.log(`Regular users: ${finalRegularUsers}`);
    
    // Archive the duplicates file
    const archiveFile = path.join(process.cwd(), `duplicate-users-${new Date().toISOString().split('T')[0]}.json`);
    fs.renameSync(DUPLICATES_FILE, archiveFile);
    console.log(`\n📁 Duplicates file archived to: ${archiveFile}`);
    
  } catch (error) {
    console.error('Error during cleanup:', error);
    throw error;
  } finally {
    await client.close();
    console.log('Disconnected from MongoDB');
  }
}

// Main function
async function main() {
  const command = process.argv[2];
  
  switch (command) {
    case 'scan':
      console.log('🔍 Running duplicate scan...');
      await scanForDuplicates();
      break;
      
    case 'cleanup':
      console.log('🧹 Running safe cleanup...');
      await cleanupTrackedDuplicates();
      break;
      
    default:
      console.log('Usage:');
      console.log('  bun scripts/safe-duplicate-cleanup.mjs scan    - Scan for duplicates and save to file');
      console.log('  bun scripts/safe-duplicate-cleanup.mjs cleanup - Remove only tracked duplicates');
      console.log('');
      console.log('This script uses a two-phase approach:');
      console.log('1. SCAN: Identifies duplicates and saves them to a file for review');
      console.log('2. CLEANUP: Removes only the specific duplicates that were identified');
      console.log('');
      console.log('This prevents accidental deletion of legitimate users.');
      break;
  }
}

main().catch(console.error);
