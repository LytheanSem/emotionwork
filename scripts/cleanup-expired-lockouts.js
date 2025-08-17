/**
 * Script to clean up expired lockout records and timed-out attempts
 * Run this periodically to keep the LoginAttempts collection clean
 */

import { getSafePayload } from "../src/lib/db-wrapper.js";

async function cleanupExpiredRecords() {
  try {
    console.log("🧹 Cleaning up expired records...");

    const payload = await getSafePayload();
    if (!payload) {
      console.error("❌ Failed to connect to database");
      process.exit(1);
    }

    const now = new Date();
    console.log(`⏰ Current time: ${now.toISOString()}`);

    // Find expired lockout records
    const expiredRecords = await payload.find({
      collection: "login-attempts",
      where: {
        lockoutUntil: {
          less_than: now,
        },
      },
      limit: 100, // Process in batches
    });

    // Find timed-out attempt records (older than 15 minutes)
    const timeoutThreshold = new Date(now.getTime() - 15 * 60 * 1000); // 15 minutes ago
    const timedOutRecords = await payload.find({
      collection: "login-attempts",
      where: {
        lastAttemptAt: {
          less_than: timeoutThreshold,
        },
      },
      limit: 100,
    });

    const totalExpired = expiredRecords.docs.length;
    const totalTimedOut = timedOutRecords.docs.length;

    if (totalExpired === 0 && totalTimedOut === 0) {
      console.log("✅ No expired records found");
      return;
    }

    console.log(
      `📊 Found ${totalExpired} expired lockouts and ${totalTimedOut} timed-out attempts`
    );

    let lockoutsCleared = 0;
    let attemptsReset = 0;

    // Clear expired lockouts
    for (const record of expiredRecords.docs) {
      try {
        const lockoutTime = new Date(record.lockoutUntil);
        const expiredMinutes = Math.ceil(
          (now.getTime() - lockoutTime.getTime()) / (60 * 1000)
        );

        await payload.delete({
          collection: "login-attempts",
          id: record.id,
        });

        console.log(
          `✅ Deleted expired lockout for ${record.email} (expired ${expiredMinutes} minutes ago)`
        );
        lockoutsCleared++;
      } catch (error) {
        console.error(
          `❌ Failed to delete expired record ${record.id}:`,
          error.message
        );
      }
    }

    // Reset timed-out attempts
    for (const record of timedOutRecords.docs) {
      try {
        const lastAttemptTime = new Date(record.lastAttemptAt);
        const timedOutMinutes = Math.ceil(
          (now.getTime() - lastAttemptTime.getTime()) / (60 * 1000)
        );

        await payload.delete({
          collection: "login-attempts",
          id: record.id,
        });

        console.log(
          `⏰ Reset timed-out attempts for ${record.email} (${timedOutMinutes} minutes old)`
        );
        attemptsReset++;
      } catch (error) {
        console.error(
          `❌ Failed to delete timed-out record ${record.id}:`,
          error.message
        );
      }
    }

    console.log(
      `\n🎉 Cleanup complete: ${lockoutsCleared} lockouts cleared, ${attemptsReset} attempts reset`
    );

    // Show remaining records
    const remainingRecords = await payload.find({
      collection: "login-attempts",
      limit: 10,
    });

    if (remainingRecords.docs.length > 0) {
      console.log(
        `\n📋 Remaining records in collection: ${remainingRecords.docs.length}`
      );
      remainingRecords.docs.forEach((record) => {
        const status = record.lockoutUntil
          ? `Locked until ${new Date(record.lockoutUntil).toLocaleString()}`
          : `${record.failedAttempts} failed attempts`;
        console.log(`  - ${record.email}: ${status}`);
      });
    } else {
      console.log("\n📋 No remaining records - collection is clean!");
    }
  } catch (error) {
    console.error("❌ Failed to cleanup expired records:", error);
    process.exit(1);
  }
}

// Run the cleanup
cleanupExpiredRecords();
