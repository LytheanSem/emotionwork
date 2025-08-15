// Simple test script to verify build configuration
console.log("Testing build configuration...");

// Test if we can import the necessary modules
try {
  const { buildConfig } = require("payload");
  console.log("✅ Payload buildConfig imported successfully");
} catch (error) {
  console.log("❌ Failed to import Payload buildConfig:", error.message);
}

try {
  const { withPayload } = require("@payloadcms/next/withPayload");
  console.log("✅ withPayload imported successfully");
} catch (error) {
  console.log("❌ Failed to import withPayload:", error.message);
}

console.log("Build configuration test completed.");
