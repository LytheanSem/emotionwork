/**
 * Script to manually clear lockouts for testing purposes
 * Run this when you want to test the lockout system without waiting
 */

import { getSafePayload } from "../src/lib/db-wrapper.js";

async function clearLockout() {
  try {
    console.log("🔓 Clearing lockouts for testing...");

    const payload = await getSafePayload();
    if (!payload) {
      console.error("❌ Failed to connect to database");
      process.exit(1);
    }

    // Find all lockout records
    const lockoutRecords = await payload.find({
      collection: "login-attempts",
      where: {
        or: [
          {
            lockoutUntil: {
              exists: true,
            },
          },
          {
            failedAttempts: {
              greater_than: 0,
            },
          },
        ],
      },
      limit: 100,
    });

    if (lockoutRecords.docs.length === 0) {
      console.log("✅ No lockout records found");
      return;
    }

    console.log(`📊 Found ${lockoutRecords.docs.length} lockout records`);

    let clearedCount = 0;
    for (const record of lockoutRecords.docs) {
      try {
        await payload.delete({
          collection: "login-attempts",
          id: record.id,
        });

        console.log(
          `✅ Cleared lockout for ${record.email} (${record.failedAttempts} failed attempts)`
        );
        clearedCount++;
      } catch (error) {
        console.error(
          `❌ Failed to clear lockout for ${record.email}:`,
          error.message
        );
      }
    }

    console.log(`\n🎉 Successfully cleared ${clearedCount} lockouts`);
  } catch (error) {
    console.error("❌ Failed to clear lockouts:", error);
    process.exit(1);
  }
}

// Run the script
clearLockout();
