#!/usr/bin/env node

import { execSync } from "child_process";
import { readFileSync, writeFileSync } from "fs";
import { join } from "path";

console.log("🔍 Analyzing bundle size...\n");

try {
  // Build the project
  console.log("📦 Building project...");
  execSync("npm run build", { stdio: "inherit" });

  // Install bundle analyzer if not present
  try {
    execSync("npm list webpack-bundle-analyzer", { stdio: "ignore" });
  } catch {
    console.log("📦 Installing webpack-bundle-analyzer...");
    execSync("npm install --save-dev webpack-bundle-analyzer", {
      stdio: "inherit",
    });
  }

  // Generate bundle analysis
  console.log("📊 Generating bundle analysis...");
  execSync("npm run build", {
    env: { ...process.env, ANALYZE: "true" },
    stdio: "inherit",
  });

  console.log("\n✅ Bundle analysis complete!");
  console.log("📁 Check the generated bundle-report.html file");

  // Generate optimization report
  generateOptimizationReport();
} catch (error) {
  console.error("❌ Bundle analysis failed:", error.message);
  process.exit(1);
}

function generateOptimizationReport() {
  console.log("\n📋 Generating optimization report...");

  const report = `
# Bundle Optimization Report

## Current Bundle Analysis
- Bundle analysis generated: bundle-report.html
- Check for large dependencies and unused code

## Optimization Recommendations

### 1. Code Splitting
- Implement dynamic imports for heavy components
- Use React.lazy() for route-based code splitting
- Consider implementing virtual scrolling for large lists

### 2. Tree Shaking
- Ensure all imports are tree-shakeable
- Use named imports instead of default imports
- Check for side effects in package.json

### 3. Bundle Optimization
- Analyze and remove unused dependencies
- Consider using smaller alternatives for heavy packages
- Implement proper chunking strategies

### 4. Image Optimization
- Use Next.js Image component with proper sizing
- Implement lazy loading for images
- Consider using WebP/AVIF formats

### 5. Performance Monitoring
- Implement Core Web Vitals tracking
- Use performance hooks for monitoring
- Set up bundle size monitoring

## Next Steps
1. Review bundle-report.html for large packages
2. Implement suggested optimizations
3. Re-run analysis to measure improvements
4. Set up continuous monitoring

Generated: ${new Date().toISOString()}
  `;

  writeFileSync("BUNDLE_OPTIMIZATION_REPORT.md", report);
  console.log(
    "📄 Optimization report generated: BUNDLE_OPTIMIZATION_REPORT.md"
  );
}
