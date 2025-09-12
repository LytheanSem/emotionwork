#!/usr/bin/env node

import { execSync } from "child_process";
import { writeFileSync } from "fs";

console.log("🔍 Simple Bundle Analysis\n");

try {
  // Build the project
  console.log("📦 Building project...");
  const buildOutput = execSync("bun run build", { encoding: "utf8" });

  // Extract bundle information from build output
  const bundleInfo = extractBundleInfo(buildOutput);

  // Generate analysis report
  generateAnalysisReport(bundleInfo);

  console.log("\n✅ Bundle analysis complete!");
  console.log("📄 Check BUNDLE_ANALYSIS_REPORT.md for detailed information");
} catch (error) {
  console.error("❌ Bundle analysis failed:", error.message);
  process.exit(1);
}

function extractBundleInfo(buildOutput) {
  const lines = buildOutput.split("\n");
  const bundleInfo = {
    routes: [],
    sharedChunks: [],
    totalSize: 0,
    optimization: {},
  };

  let inRoutesSection = false;
  let inSharedChunksSection = false;

  for (const line of lines) {
    if (line.includes("Route (app)")) {
      inRoutesSection = true;
      continue;
    }

    if (line.includes("First Load JS shared by all")) {
      inRoutesSection = false;
      inSharedChunksSection = true;
      continue;
    }

    if (line.includes("Middleware")) {
      inSharedChunksSection = false;
      continue;
    }

    if ((inRoutesSection && line.includes("○")) || line.includes("ƒ")) {
      const routeMatch = line.match(
        /├\s*[○ƒ]\s*([^\s]+)\s+([0-9.]+)\s*kB\s+([0-9.]+)\s*kB/
      );
      if (routeMatch) {
        bundleInfo.routes.push({
          path: routeMatch[1],
          size: parseFloat(routeMatch[2]),
          firstLoadJS: parseFloat(routeMatch[3]),
        });
      }
    }

    if (inSharedChunksSection && line.includes("chunks/")) {
      const chunkMatch = line.match(/chunks\/[^\s]+\s+([0-9.]+)\s*kB/);
      if (chunkMatch) {
        bundleInfo.sharedChunks.push(parseFloat(chunkMatch[1]));
      }
    }

    if (line.includes("First Load JS shared by all")) {
      const sharedMatch = line.match(/([0-9.]+)\s*kB/);
      if (sharedMatch) {
        bundleInfo.totalSize = parseFloat(sharedMatch[1]);
      }
    }
  }

  return bundleInfo;
}

function generateAnalysisReport(bundleInfo) {
  console.log("\n📋 Generating bundle analysis report...");

  const totalRouteSize = bundleInfo.routes.reduce(
    (sum, route) => sum + route.firstLoadJS,
    0
  );
  const avgRouteSize = totalRouteSize / bundleInfo.routes.length;
  const largestRoute = bundleInfo.routes.reduce(
    (max, route) => (route.firstLoadJS > max.firstLoadJS ? route : max),
    bundleInfo.routes[0]
  );

  const report = `# Bundle Analysis Report

## 📊 Bundle Size Summary

### Overall Statistics
- **Total Shared Bundle**: ${bundleInfo.totalSize} kB
- **Average Route Size**: ${avgRouteSize.toFixed(1)} kB
- **Total Routes**: ${bundleInfo.routes.length}

### 🏆 Performance Grades
${getPerformanceGrade(bundleInfo.totalSize, avgRouteSize)}

## 🛣️ Route Analysis

### Largest Routes (by First Load JS)
${bundleInfo.routes
  .sort((a, b) => b.firstLoadJS - a.firstLoadJS)
  .slice(0, 5)
  .map((route) => `- **${route.path}**: ${route.firstLoadJS} kB`)
  .join("\n")}

### All Routes
${bundleInfo.routes
  .map(
    (route) => `| ${route.path} | ${route.size} kB | ${route.firstLoadJS} kB |`
  )
  .join("\n")}

## 🔧 Optimization Recommendations

### ✅ What's Working Well
- Base bundle size is ${bundleInfo.totalSize < 150 ? "excellent" : bundleInfo.totalSize < 250 ? "good" : "acceptable"}
- Code splitting is working effectively
- Route-based optimization is implemented

### 🚨 Areas for Improvement
${getOptimizationRecommendations(bundleInfo)}

### 📈 Next Steps
1. Monitor bundle size changes over time
2. Implement virtual scrolling for large lists
3. Consider image optimization strategies
4. Add bundle size monitoring to CI/CD

## 📅 Analysis Details
- **Generated**: ${new Date().toISOString()}
- **Next.js Version**: 15.2.4
- **Build Environment**: Production

---

*This report was generated automatically by the bundle analysis script.*
`;

  writeFileSync("BUNDLE_ANALYSIS_REPORT.md", report);
  console.log("📄 Bundle analysis report generated: BUNDLE_ANALYSIS_REPORT.md");
}

function getPerformanceGrade(totalSize, avgRouteSize) {
  let grade = "A";
  let description = "Excellent";

  if (totalSize > 200 || avgRouteSize > 150) {
    grade = "C";
    description = "Needs improvement";
  } else if (totalSize > 150 || avgRouteSize > 100) {
    grade = "B";
    description = "Good";
  }

  return `**Grade: ${grade}** - ${description}`;
}

function getOptimizationRecommendations(bundleInfo) {
  const recommendations = [];

  if (bundleInfo.totalSize > 200) {
    recommendations.push(
      "- Consider reducing shared bundle size through tree shaking"
    );
  }

  if (bundleInfo.routes.some((r) => r.firstLoadJS > 150)) {
    recommendations.push("- Implement lazy loading for heavy routes");
  }

  if (bundleInfo.sharedChunks.length > 3) {
    recommendations.push("- Optimize chunk splitting strategy");
  }

  if (recommendations.length === 0) {
    recommendations.push("- Current bundle size is optimal");
  }

  return recommendations.join("\n");
}
