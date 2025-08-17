/**
 * Script to set up admin user role in the database
 * Run this script after updating your Users collection to add the role field
 */

import { getSafePayload } from "../src/lib/db-wrapper.js";

async function setupAdminRole() {
  try {
    console.log("🔧 Setting up admin user role...");

    const payload = await getSafePayload();
    if (!payload) {
      console.error("❌ Failed to connect to database");
      process.exit(1);
    }

    // Find all users
    const users = await payload.find({
      collection: "users",
      limit: 100,
    });

    console.log(`📊 Found ${users.docs.length} users in database`);

    let updatedCount = 0;
    let adminCount = 0;

    for (const user of users.docs) {
      // If user has no role, set it to 'user' by default
      if (!user.role) {
        try {
          await payload.update({
            collection: "users",
            id: user.id,
            data: {
              role: "user",
            },
          });
          console.log(`✅ Updated user ${user.username} with role: user`);
          updatedCount++;
        } catch (error) {
          console.error(
            `❌ Failed to update user ${user.username}:`,
            error.message
          );
        }
      } else if (user.role === "admin") {
        adminCount++;
        console.log(`👑 User ${user.username} already has admin role`);
      } else {
        console.log(`👤 User ${user.username} has role: ${user.role}`);
      }
    }

    // If no admin users exist, create one (you'll need to provide credentials)
    if (adminCount === 0) {
      console.log("\n⚠️  No admin users found!");
      console.log("To create an admin user:");
      console.log("1. Go to your admin panel at /admin");
      console.log("2. Create a new user or edit an existing user");
      console.log("3. Set their role to 'admin'");
      console.log("4. Save the user");
    }

    console.log(`\n✅ Setup complete!`);
    console.log(`📝 Updated ${updatedCount} users`);
    console.log(`👑 Found ${adminCount} admin users`);
  } catch (error) {
    console.error("❌ Setup failed:", error);
    process.exit(1);
  }
}

// Run the setup
setupAdminRole();
