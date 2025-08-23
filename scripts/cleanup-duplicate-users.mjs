import { MongoClient } from "mongodb";

const uri = process.env.DATABASE_URI || "mongodb://localhost:27017/emotionwork";

async function cleanupDuplicateUsers() {
  let client;
  try {
    console.log("🧹 Cleaning up duplicate users...");

    client = new MongoClient(uri);
    await client.connect();

    const db = client.db();
    const usersCollection = db.collection("users");

    // Find all users
    const allUsers = await usersCollection.find({}).toArray();
    console.log(`📊 Found ${allUsers.length} total users`);

    // Group users by email to find duplicates
    const emailGroups = {};
    allUsers.forEach((user) => {
      if (!emailGroups[user.email]) {
        emailGroups[user.email] = [];
      }
      emailGroups[user.email].push(user);
    });

    // Find emails with multiple users
    const duplicates = Object.entries(emailGroups).filter(
      ([email, users]) => users.length > 1
    );

    if (duplicates.length === 0) {
      console.log("✅ No duplicate users found");
      return;
    }

    console.log(`🔍 Found ${duplicates.length} emails with duplicate users:`);

    for (const [email, users] of duplicates) {
      console.log(`\n📧 Email: ${email}`);
      console.log(`   Users: ${users.length}`);

      // Keep the first user (oldest) and delete the rest
      const [keepUser, ...deleteUsers] = users.sort(
        (a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0)
      );

      console.log(`   Keeping: ${keepUser.username} (${keepUser._id})`);
      console.log(`   Deleting: ${deleteUsers.length} duplicates`);

      // Delete duplicate users
      for (const deleteUser of deleteUsers) {
        await usersCollection.deleteOne({ _id: deleteUser._id });
        console.log(
          `   ❌ Deleted: ${deleteUser.username} (${deleteUser._id})`
        );
      }
    }

    // Also clean up any users without proper structure
    const invalidUsers = await usersCollection
      .find({
        $or: [
          { email: { $exists: false } },
          { username: { $exists: false } },
          { role: { $exists: false } },
        ],
      })
      .toArray();

    if (invalidUsers.length > 0) {
      console.log(
        `\n⚠️  Found ${invalidUsers.length} users with invalid structure:`
      );
      for (const user of invalidUsers) {
        console.log(
          `   ❌ Invalid user: ${user._id} - missing required fields`
        );
        await usersCollection.deleteOne({ _id: user._id });
      }
    }

    console.log("\n✅ Cleanup completed!");

    // Show final user count
    const finalCount = await usersCollection.countDocuments();
    console.log(`📊 Final user count: ${finalCount}`);
  } catch (error) {
    console.error("❌ Error during cleanup:", error);
  } finally {
    if (client) {
      await client.close();
    }
  }
}

// Run the cleanup
cleanupDuplicateUsers();
