/**
 * Cloudinary Migration Script
 *
 * This script migrates all folders and pictures from one Cloudinary account to another,
 * preserving the complete folder structure and metadata.
 *
 * USAGE:
 * 1. Set the following environment variables:
 *    - CLOUDINARY_SOURCE_CLOUD_NAME (source account cloud name)
 *    - CLOUDINARY_SOURCE_API_KEY (source account API key)
 *    - CLOUDINARY_SOURCE_API_SECRET (source account API secret)
 *    - CLOUDINARY_DEST_CLOUD_NAME (destination account cloud name)
 *    - CLOUDINARY_DEST_API_KEY (destination account API key)
 *    - CLOUDINARY_DEST_API_SECRET (destination account API secret)
 *
 * 2. Run the script:
 *    bun scripts/migrate-cloudinary.mjs
 *    or
 *    node scripts/migrate-cloudinary.mjs
 *
 * FEATURES:
 * - Preserves folder structure
 * - Preserves public IDs
 * - Preserves metadata (tags, context)
 * - Resume capability (saves progress, can be re-run)
 * - Batch processing with rate limiting
 * - Detailed progress reporting
 *
 * The script creates a migration log file (cloudinary-migration-log.json) that tracks
 * progress. If the script is interrupted, you can re-run it and it will skip already
 * migrated resources.
 */

import { v2 as cloudinary } from "cloudinary";
import "dotenv/config";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration - Set these environment variables or modify here
const SOURCE_CONFIG = {
  cloud_name: process.env.CLOUDINARY_SOURCE_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_SOURCE_API_KEY,
  api_secret: process.env.CLOUDINARY_SOURCE_API_SECRET,
};

const DEST_CONFIG = {
  cloud_name: process.env.CLOUDINARY_DEST_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_DEST_API_KEY,
  api_secret: process.env.CLOUDINARY_DEST_API_SECRET,
};

// Migration settings
const BATCH_SIZE = 10; // Number of resources to process in parallel
const DELAY_BETWEEN_BATCHES = 1000; // Delay in ms between batches (to avoid rate limits)
const MIGRATION_LOG_FILE = path.join(__dirname, "cloudinary-migration-log.json");

// Statistics
let stats = {
  total: 0,
  migrated: 0,
  skipped: 0,
  failed: 0,
  errors: [],
};

// Load migration log (for resuming)
function loadMigrationLog() {
  try {
    if (fs.existsSync(MIGRATION_LOG_FILE)) {
      const data = fs.readFileSync(MIGRATION_LOG_FILE, "utf-8");
      return JSON.parse(data);
    }
  } catch (error) {
    console.warn("⚠️  Could not load migration log:", error.message);
  }
  return { migrated: [], failed: [] };
}

// Save migration log
function saveMigrationLog(log) {
  try {
    fs.writeFileSync(MIGRATION_LOG_FILE, JSON.stringify(log, null, 2));
  } catch (error) {
    console.warn("⚠️  Could not save migration log:", error.message);
  }
}

// Validate configuration
function validateConfig() {
  const missing = [];

  if (!SOURCE_CONFIG.cloud_name) missing.push("CLOUDINARY_SOURCE_CLOUD_NAME");
  if (!SOURCE_CONFIG.api_key) missing.push("CLOUDINARY_SOURCE_API_KEY");
  if (!SOURCE_CONFIG.api_secret) missing.push("CLOUDINARY_SOURCE_API_SECRET");

  if (!DEST_CONFIG.cloud_name) missing.push("CLOUDINARY_DEST_CLOUD_NAME");
  if (!DEST_CONFIG.api_key) missing.push("CLOUDINARY_DEST_API_KEY");
  if (!DEST_CONFIG.api_secret) missing.push("CLOUDINARY_DEST_API_SECRET");

  if (missing.length > 0) {
    console.error("❌ Missing required environment variables:");
    missing.forEach((varName) => console.error(`   - ${varName}`));
    console.error("\n💡 Set these in your .env file or export them before running the script.");
    process.exit(1);
  }
}

// Get all resources from source account
async function getAllResources(sourceCloudinary) {
  console.log("📋 Fetching all resources from source account...");

  const allResources = [];
  let nextCursor = null;
  let page = 1;

  do {
    try {
      const options = {
        max_results: 500, // Maximum allowed by Cloudinary
        type: "upload", // Only uploaded resources (not fetched)
      };

      if (nextCursor) {
        options.next_cursor = nextCursor;
      }

      const result = await sourceCloudinary.api.resources(options);

      if (result.resources && result.resources.length > 0) {
        allResources.push(...result.resources);
        console.log(`   📄 Page ${page}: Found ${result.resources.length} resources (Total: ${allResources.length})`);
      }

      nextCursor = result.next_cursor;
      page++;

      // Small delay to avoid rate limits
      if (nextCursor) {
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
    } catch (error) {
      console.error(`❌ Error fetching resources:`, error.message);
      if (error.http_code === 401) {
        console.error("   Authentication failed. Please check your source account credentials.");
        process.exit(1);
      }
      throw error;
    }
  } while (nextCursor);

  console.log(`\n✅ Found ${allResources.length} total resources to migrate\n`);
  return allResources;
}

// Migrate a single resource
async function migrateResource(resource, sourceCloudName, sourceApiKey, sourceApiSecret, destConfig, migrationLog) {
  const publicId = resource.public_id;
  const resourceType = resource.resource_type || "image";

  // Check if already migrated
  if (migrationLog.migrated.includes(publicId)) {
    stats.skipped++;
    return { success: true, skipped: true, publicId };
  }

  try {
    // Configure source to get the URL
    cloudinary.config({
      cloud_name: sourceCloudName,
      api_key: sourceApiKey,
      api_secret: sourceApiSecret,
    });

    // Extract folder structure from public_id
    const folderPath = publicId.includes("/") ? publicId.substring(0, publicId.lastIndexOf("/")) : "";

    // Try to get the resource details first (for private resources)
    let sourceUrl;

    try {
      // First, try to get resource info to check if it's accessible
      const resourceInfo = await cloudinary.api.resource(publicId, {
        resource_type: resourceType,
      });

      // If we can get resource info, try to get the URL
      sourceUrl = cloudinary.url(publicId, {
        secure: true,
        resource_type: resourceType,
      });
    } catch (apiError) {
      // If API call fails, try using signed URL or direct download
      console.warn(`   ⚠️  Resource ${publicId} may be private, trying alternative method...`);

      // Try with signed URL
      try {
        sourceUrl = cloudinary.url(publicId, {
          secure: true,
          resource_type: resourceType,
          sign_url: true,
        });
      } catch (signedError) {
        // Last resort: try to download directly using Admin API
        try {
          const resourceData = await cloudinary.api.resource(publicId, {
            resource_type: resourceType,
          });

          // If we have a secure_url in the resource data, use it
          if (resourceData.secure_url) {
            sourceUrl = resourceData.secure_url;
          } else {
            throw new Error("Cannot access resource URL");
          }
        } catch (downloadError) {
          throw new Error(`Cannot access resource: ${downloadError.message}`);
        }
      }
    }

    // Configure for destination account
    cloudinary.config(destConfig);

    // Upload to destination account
    const uploadOptions = {
      public_id: publicId, // Preserve the same public_id
      folder: folderPath || undefined, // Preserve folder structure
      resource_type: resourceType,
      overwrite: false, // Don't overwrite existing files
      invalidate: true,
      // Preserve metadata if available
      context: resource.context || undefined,
      tags: resource.tags || undefined,
    };

    // Upload from URL (more efficient than downloading and re-uploading)
    const result = await cloudinary.uploader.upload(sourceUrl, uploadOptions);

    // Update migration log
    migrationLog.migrated.push(publicId);
    saveMigrationLog(migrationLog);

    stats.migrated++;

    return {
      success: true,
      publicId,
      newUrl: result.secure_url,
    };
  } catch (error) {
    const errorMsg = error.message || "Unknown error";

    // Check if it's a duplicate (already exists in destination)
    if (error.http_code === 409 || errorMsg.includes("already exists")) {
      stats.skipped++;
      migrationLog.migrated.push(publicId);
      saveMigrationLog(migrationLog);
      return { success: true, skipped: true, publicId, reason: "already exists" };
    }

    stats.failed++;
    stats.errors.push({ publicId, error: errorMsg });

    if (!migrationLog.failed.includes(publicId)) {
      migrationLog.failed.push(publicId);
      saveMigrationLog(migrationLog);
    }

    return {
      success: false,
      publicId,
      error: errorMsg,
    };
  }
}

// Process resources in batches (sequential to avoid config conflicts)
async function processBatch(batch, sourceCloudName, sourceApiKey, sourceApiSecret, destConfig, migrationLog) {
  const results = [];

  // Process sequentially to avoid Cloudinary config conflicts
  for (const resource of batch) {
    const result = await migrateResource(
      resource,
      sourceCloudName,
      sourceApiKey,
      sourceApiSecret,
      destConfig,
      migrationLog
    );
    results.push({ status: "fulfilled", value: result });
  }

  return results;
}

// Main migration function
async function migrateCloudinary() {
  console.log("🚀 Starting Cloudinary Migration\n");
  console.log("=".repeat(60));

  // Validate configuration
  validateConfig();

  // Load migration log
  const migrationLog = loadMigrationLog();
  console.log(
    `📝 Migration log loaded: ${migrationLog.migrated.length} already migrated, ${migrationLog.failed.length} previously failed\n`
  );

  try {
    // Configure source Cloudinary for listing resources
    cloudinary.config(SOURCE_CONFIG);

    // Get all resources from source
    const resources = await getAllResources(cloudinary);
    stats.total = resources.length;

    // Filter out already migrated resources
    const resourcesToMigrate = resources.filter((r) => !migrationLog.migrated.includes(r.public_id));

    console.log(`📊 Migration Summary:`);
    console.log(`   Total resources: ${stats.total}`);
    console.log(`   Already migrated: ${migrationLog.migrated.length}`);
    console.log(`   To migrate: ${resourcesToMigrate.length}\n`);

    if (resourcesToMigrate.length === 0) {
      console.log("✅ All resources have already been migrated!");
      return;
    }

    // Process resources in batches
    console.log("🔄 Starting migration process...\n");

    for (let i = 0; i < resourcesToMigrate.length; i += BATCH_SIZE) {
      const batch = resourcesToMigrate.slice(i, i + BATCH_SIZE);
      const batchNum = Math.floor(i / BATCH_SIZE) + 1;
      const totalBatches = Math.ceil(resourcesToMigrate.length / BATCH_SIZE);

      console.log(`📦 Processing batch ${batchNum}/${totalBatches} (${batch.length} resources)...`);

      const results = await processBatch(
        batch,
        SOURCE_CONFIG.cloud_name,
        SOURCE_CONFIG.api_key,
        SOURCE_CONFIG.api_secret,
        DEST_CONFIG,
        migrationLog
      );

      // Log batch results
      const successful = results.filter((r) => r.status === "fulfilled" && r.value.success).length;
      const failed = results.filter(
        (r) => r.status === "rejected" || (r.status === "fulfilled" && !r.value.success)
      ).length;

      console.log(`   ✅ Success: ${successful}, ❌ Failed: ${failed}`);
      console.log(
        `   📊 Progress: ${stats.migrated + stats.skipped}/${stats.total} (${Math.round(((stats.migrated + stats.skipped) / stats.total) * 100)}%)\n`
      );

      // Delay between batches to avoid rate limits
      if (i + BATCH_SIZE < resourcesToMigrate.length) {
        await new Promise((resolve) => setTimeout(resolve, DELAY_BETWEEN_BATCHES));
      }
    }

    // Final summary
    console.log("=".repeat(60));
    console.log("🎉 Migration Complete!\n");
    console.log("📊 Final Statistics:");
    console.log(`   Total resources: ${stats.total}`);
    console.log(`   ✅ Successfully migrated: ${stats.migrated}`);
    console.log(`   ⏭️  Skipped (already exists): ${stats.skipped}`);
    console.log(`   ❌ Failed: ${stats.failed}`);

    if (stats.failed > 0) {
      console.log(`\n⚠️  ${stats.failed} resources failed to migrate. Check the migration log for details.`);
      console.log(`   Failed resources are saved in: ${MIGRATION_LOG_FILE}`);
      console.log("\n💡 You can re-run this script to retry failed migrations.");
    }

    if (stats.errors.length > 0 && stats.errors.length <= 10) {
      console.log("\n❌ Errors encountered:");
      stats.errors.forEach((err) => {
        console.log(`   - ${err.publicId}: ${err.error}`);
      });
    }

    console.log(`\n📝 Migration log saved to: ${MIGRATION_LOG_FILE}`);
  } catch (error) {
    console.error("\n❌ Migration failed:", error);
    console.error("\n💡 Migration progress has been saved. You can re-run the script to continue.");
    process.exit(1);
  }
}

// Run migration
migrateCloudinary().catch((error) => {
  console.error("❌ Fatal error:", error);
  process.exit(1);
});
