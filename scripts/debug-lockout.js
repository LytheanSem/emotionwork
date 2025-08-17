#!/usr/bin/env node

/**
 * Debug script to diagnose persistent lockout issues
 * This script checks both our LoginAttempts collection and PayloadCMS internal state
 */

import { getSafePayload } from "../src/lib/db-wrapper.ts";
import { loginSecurityService } from "../src/lib/login-security.ts";

async function debugLockout() {
  console.log("🔍 Debugging lockout system...\n");

  try {
    const payload = await getSafePayload();
    if (!payload) {
      console.error("❌ Failed to connect to database");
      return;
    }

    // Test email - replace with the email you're having issues with
    const testEmail = "lightkira508@gmail.com"; // Replace with your test email
    console.log(`📧 Debugging lockout for: ${testEmail}`);

    // 1. Check our LoginAttempts collection
    console.log("\n📝 Checking LoginAttempts collection...");
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
      const record = attempts.docs[0];
      console.log("Login attempts record found:", {
        id: record.id,
        email: record.email,
        failedAttempts: record.failedAttempts,
        lockoutUntil: record.lockoutUntil,
        lastAttemptAt: record.lastAttemptAt,
        ipAddress: record.ipAddress,
        userAgent: record.userAgent,
      });

      // Check if lockout should be expired
      if (record.lockoutUntil) {
        const lockoutTime = new Date(record.lockoutUntil);
        const now = new Date();
        const timeDiff = now.getTime() - lockoutTime.getTime();
        const minutesRemaining = Math.ceil(timeDiff / 60000);

        if (timeDiff > 0) {
          console.log(
            `⏰ Lockout should be expired (${minutesRemaining} minutes ago)`
          );
        } else {
          console.log(
            `🔒 Lockout still active (${Math.abs(minutesRemaining)} minutes remaining)`
          );
        }
      }
    } else {
      console.log("✅ No login attempts record found");
    }

    // 2. Check user state in Users collection
    console.log("\n👤 Checking user state in Users collection...");
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
      const userRecord = user.docs[0];
      console.log("User found:", {
        id: userRecord.id,
        email: userRecord.email,
        username: userRecord.username,
        role: userRecord.role,
        createdAt: userRecord.createdAt,
        updatedAt: userRecord.updatedAt,
      });
    } else {
      console.log("❌ User not found");
      return;
    }

    // 3. Test our lockout service
    console.log("\n🔍 Testing lockout service...");
    const lockoutStatus = await loginSecurityService.checkLockoutStatus(
      testEmail,
      "::1"
    );
    console.log("Lockout service result:", lockoutStatus);

    // 4. Try to manually clear any lockout
    if (attempts.docs.length > 0) {
      console.log("\n🔓 Attempting manual lockout clear...");
      await loginSecurityService.clearLockout(testEmail, "::1");
      console.log("✅ Manual lockout clear completed");

      // Check status after clear
      const finalStatus = await loginSecurityService.checkLockoutStatus(
        testEmail,
        "::1"
      );
      console.log("Status after clear:", finalStatus);
    }

    // 5. Test a direct PayloadCMS login attempt
    console.log("\n🧪 Testing direct PayloadCMS login...");
    try {
      // This will fail with wrong password, but we can see the error message
      const testLogin = await payload.login({
        collection: "users",
        data: {
          email: testEmail,
          password: "wrongpassword",
        },
      });
      console.log("Unexpected success:", testLogin);
    } catch (error) {
      console.log("Expected login failure:", error.message);

      // Check if it's a lockout error
      if (
        error.message.includes("locked") ||
        error.message.includes("too many")
      ) {
        console.log("🚨 PAYLOADCMS INTERNAL LOCKOUT DETECTED!");
        console.log(
          "This means PayloadCMS still has the user locked internally"
        );
      }
    }

    console.log("\n🎉 Debug completed!");
  } catch (error) {
    console.error("❌ Debug failed:", error);
  } finally {
    process.exit(0);
  }
}

debugLockout();
