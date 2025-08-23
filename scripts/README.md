# 📜 Admin Scripts

This directory contains essential scripts for managing the EmotionWork application.

## **Available Scripts:**

### **🔐 `change-admin-password.mjs`**

- **Purpose**: Change admin user password securely
- **Usage**: `node scripts/change-admin-password.mjs`
- **Security**: Interactive password input, no hardcoded values

### **👤 `create-admin-in-users-final.mjs`**

- **Purpose**: Create admin user in Users collection
- **Usage**: `node scripts/create-admin-in-users-final.mjs`
- **Use Case**: Initial setup or admin user recreation

### **🔄 `fix-admin-role.mjs`**

- **Purpose**: Fix admin user role if incorrectly set
- **Usage**: `node scripts/fix-admin-role.mjs`
- **Use Case**: Troubleshooting admin access issues

### **🧹 `cleanup-users-collection.mjs`**

- **Purpose**: Clean up Users collection
- **Usage**: `node scripts/cleanup-users-collection.mjs`
- **Use Case**: Remove duplicate or incorrect user entries

## **Removed Scripts:**

- ❌ Lockout-related scripts (no longer needed with OAuth)
- ❌ Test connection scripts (development only)
- ❌ Setup scripts (one-time use)

## **Security Notes:**

- All scripts use environment variables for database connection
- No hardcoded credentials
- Admin-only operations are properly protected
