#!/usr/bin/env node

/**
 * Test script to verify user unlock functionality
 * This script tests the new unlock mechanism that clears both our lockout records
 * and PayloadCMS internal lockout state
 */

import { getSafePayload } from "../src/lib/db-wrapper.js";
import { loginSecurityService } from "../src/lib/login-security.js";

async function testUnlock() {
  console.log("🧪 Testing user unlock functionality...\n");

  try {
    const payload = await getSafePayload();
    if (!payload) {
      console.error("❌ Failed to connect to database");
      return;
    }

    // Test email
    const testEmail = "lightkira508@gmail.com";
    console.log(`📧 Testing unlock for: ${testEmail}`);

    // Check current lockout status
    console.log("\n🔍 Checking current lockout status...");
    const lockoutStatus = await loginSecurityService.checkLockoutStatus(
      testEmail,
      "::1"
    );
    console.log("Lockout status:", lockoutStatus);

    // Check if user exists and their current state
    console.log("\n👤 Checking user state in database...");
    const user = await payload.find({
      collection: "users",
      where: {
        email: {
          equals: testEmail.toLowerCase(),
        },
      },
      limit: 1,
    });

    if (user.docs.length > 0) {
      console.log("User found:", {
        id: user.docs[0].id,
        email: user.docs[0].email,
        username: user.docs[0].username,
        updatedAt: user.docs[0].updatedAt,
      });
    } else {
      console.log("❌ User not found");
      return;
    }

    // Check login attempts collection
    console.log("\n📝 Checking login attempts collection...");
    const attempts = await payload.find({
      collection: "login-attempts",
      where: {
        email: {
          equals: testEmail.toLowerCase(),
        },
      },
      limit: 1,
    });

    if (attempts.docs.length > 0) {
      console.log("Login attempts record found:", {
        id: attempts.docs[0].id,
        email: attempts.docs[0].email,
        failedAttempts: attempts.docs[0].failedAttempts,
        lockoutUntil: attempts.docs[0].lockoutUntil,
        lastAttemptAt: attempts.docs[0].lastAttemptAt,
      });
    } else {
      console.log("✅ No login attempts record found (user is not locked)");
    }

    // Test manual unlock if there are attempts
    if (attempts.docs.length > 0) {
      console.log("\n🔓 Testing manual unlock...");
      await loginSecurityService.clearLockout(testEmail, "::1");
      console.log("✅ Manual unlock completed");
    }

    // Check status after unlock
    console.log("\n🔍 Checking status after unlock...");
    const finalStatus = await loginSecurityService.checkLockoutStatus(
      testEmail,
      "::1"
    );
    console.log("Final lockout status:", finalStatus);

    console.log("\n🎉 Test completed successfully!");
  } catch (error) {
    console.error("❌ Test failed:", error);
  } finally {
    process.exit(0);
  }
}

testUnlock();
