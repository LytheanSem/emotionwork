import { MongoClient } from 'mongodb';

async function restoreUsers() {
  const client = new MongoClient('mongodb://localhost:27017/emotionwork');
  
  try {
    await client.connect();
    console.log('✅ Connected to MongoDB');
    
    const db = client.db();
    
    // Create the user collections if they don't exist
    console.log('\n🔧 Setting up user collections...');
    
    // Create admin users collection
    await db.createCollection('adminUsers');
    console.log('✅ Created adminUsers collection');
    
    // Create manager users collection
    await db.createCollection('managerUsers');
    console.log('✅ Created managerUsers collection');
    
    // Create regular users collection
    await db.createCollection('regularUsers');
    console.log('✅ Created regularUsers collection');
    
    // Restore the users you had before
    console.log('\n👥 Restoring users...');
    
    // Admin Users
    const adminUsers = [
      {
        email: 'paveenachuayaem31@gmail.com',
        username: 'paveena chuayaem',
        role: 'admin',
        image: null,
        provider: 'google',
        providerId: 'google_123',
        permissions: ['read', 'write', 'delete', 'admin'],
        lastLogin: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        email: 'lytheansem430@gmail.com',
        username: 'Lythean Sem1',
        role: 'admin',
        image: null,
        provider: 'google',
        providerId: 'google_456',
        permissions: ['read', 'write', 'delete', 'admin'],
        lastLogin: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
    
    // Manager Users
    const managerUsers = [
      {
        email: 'u6430170@au.edu',
        username: 'VIBOL ROTHMONY SENG',
        role: 'manager',
        image: null,
        provider: 'google',
        providerId: 'google_789',
        permissions: ['read', 'write', 'upload'],
        lastLogin: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
    
    // Regular Users
    const regularUsers = [
      {
        email: 'lightkira508@gmail.com',
        username: 'Lythean Sem',
        role: 'user',
        image: null,
        provider: 'google',
        providerId: 'google_101',
        profile: {
          firstName: 'Lythean',
          lastName: 'Sem'
        },
        preferences: {
          notifications: true,
          theme: 'light'
        },
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        email: 'admin@emotionwork.com',
        username: 'Admin',
        role: 'user',
        image: null,
        provider: 'google',
        providerId: 'google_102',
        profile: {
          firstName: 'Admin',
          lastName: 'User'
        },
        preferences: {
          notifications: true,
          theme: 'light'
        },
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
    
    // Insert admin users
    if (adminUsers.length > 0) {
      const adminResult = await db.collection('adminUsers').insertMany(adminUsers);
      console.log(`✅ Restored ${adminResult.insertedCount} admin users`);
    }
    
    // Insert manager users
    if (managerUsers.length > 0) {
      const managerResult = await db.collection('managerUsers').insertMany(managerUsers);
      console.log(`✅ Restored ${managerResult.insertedCount} manager users`);
    }
    
    // Insert regular users
    if (regularUsers.length > 0) {
      const regularResult = await db.collection('regularUsers').insertMany(regularUsers);
      console.log(`✅ Restored ${regularResult.insertedCount} regular users`);
    }
    
    // Verify the restoration
    console.log('\n📊 Verification:');
    const finalAdminCount = await db.collection('adminUsers').countDocuments();
    const finalManagerCount = await db.collection('managerUsers').countDocuments();
    const finalRegularCount = await db.collection('regularUsers').countDocuments();
    
    console.log(`Admin users: ${finalAdminCount}`);
    console.log(`Manager users: ${finalManagerCount}`);
    console.log(`Regular users: ${finalRegularCount}`);
    
    console.log('\n🎉 User restoration completed!');
    console.log('You can now log in with any of these accounts:');
    console.log('- Admin: paveenachuayaem31@gmail.com');
    console.log('- Admin: lytheansem430@gmail.com');
    console.log('- Manager: u6430170@au.edu');
    console.log('- User: lightkira508@gmail.com');
    console.log('- User: admin@emotionwork.com');
    
  } catch (error) {
    console.error('❌ Error during restoration:', error);
  } finally {
    await client.close();
    console.log('\n✅ Disconnected from MongoDB');
  }
}

restoreUsers().catch(console.error);








