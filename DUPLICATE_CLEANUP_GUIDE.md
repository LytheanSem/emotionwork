# 🛡️ Safe Duplicate User Cleanup Guide

## ⚠️ **Important: Previous Cleanup Script Was Unsafe**

The original `cleanup-duplicate-users.mjs` script has been **deprecated** because it was too aggressive and could delete legitimate users. It would delete ALL users with the same email from lower-priority collections, even if they weren't actual duplicates.

## ✅ **New Safe Approach: Two-Phase Cleanup**

### **Phase 1: Scan and Track Duplicates**
```bash
bun scripts/safe-duplicate-cleanup.mjs scan
```

**What it does:**
- 🔍 Scans all user collections for actual duplicates
- 📊 Identifies users with the same email in multiple collections
- 📄 Saves duplicate information to `duplicate-users.json` for review
- 🛡️ **Does NOT delete anything** - only identifies and tracks

**Output:**
- Creates `duplicate-users.json` with detailed duplicate information
- Shows exactly which users will be affected
- Provides clear reasoning for each duplicate decision

### **Phase 2: Safe Cleanup (Only After Review)**
```bash
bun scripts/safe-duplicate-cleanup.mjs cleanup
```

**What it does:**
- 📖 Reads the tracked duplicates from `duplicate-users.json`
- 🎯 Removes ONLY the specific users that were identified as duplicates
- 🔒 **Cannot delete users that weren't specifically tracked**
- 📁 Archives the duplicate file after cleanup

## 🔍 **How It Works**

### **Duplicate Detection Logic:**
1. **Scans all collections**: `adminUsers`, `managerUsers`, `regularUsers`
2. **Groups by email**: Finds users with same email across collections
3. **Priority system**: `admin` > `manager` > `user`
4. **Tracks specifics**: Records exact user IDs and collection names

### **Safe Cleanup Logic:**
1. **Loads tracked data**: Only processes users from the scan file
2. **Specific deletion**: Removes only the exact user IDs that were tracked
3. **No broad deletion**: Cannot accidentally remove legitimate users
4. **Audit trail**: Archives all actions for review

## 📋 **Example Workflow**

### **Step 1: Scan for Duplicates**
```bash
$ bun scripts/safe-duplicate-cleanup.mjs scan

🔍 Scanning for duplicate users...
Found 5 admin users
Found 3 manager users
Found 12 regular users

⚠️  Duplicate found: john@example.com
   Keeping: adminUsers (admin)
   Removing: regularUsers (user)

📄 Duplicate information saved to: duplicate-users.json
📊 Found 1 users with duplicates
```

### **Step 2: Review the Results**
```bash
$ cat duplicate-users.json
{
  "timestamp": "2024-01-15T10:30:00.000Z",
  "totalDuplicates": 1,
  "duplicates": {
    "john@example.com": {
      "keep": {
        "_id": "ObjectId('...')",
        "email": "john@example.com",
        "role": "admin",
        "collection": "adminUsers"
      },
      "remove": [
        {
          "_id": "ObjectId('...')",
          "email": "john@example.com", 
          "role": "user",
          "collection": "regularUsers"
        }
      ],
      "reason": "User exists in 2 collections, keeping highest priority role: admin"
    }
  }
}
```

### **Step 3: Safe Cleanup**
```bash
$ bun scripts/safe-duplicate-cleanup.mjs cleanup

📄 Loaded 1 tracked duplicates from duplicate-users.json
📅 Scan timestamp: 2024-01-15T10:30:00.000Z

⚠️  WARNING: This will permanently delete the following users:

📧 john@example.com:
   ✅ Keeping: adminUsers (admin)
   🗑️  Removing: regularUsers (user) - ID: ObjectId('...')
   📝 Reason: User exists in 2 collections, keeping highest priority role: admin

🧹 Starting safe cleanup...

🔧 Processing john@example.com...
   ✅ Removed john@example.com from regularUsers (ID: ObjectId('...'))

🎉 Cleanup completed! Removed 1 duplicate users.

📊 Final user counts:
Admin users: 5
Manager users: 3
Regular users: 11

📁 Duplicates file archived to: duplicate-users-2024-01-15.json
```

## 🛡️ **Safety Features**

### **1. Two-Phase Approach**
- **Scan first**: Identify and review before any deletion
- **Cleanup second**: Only remove what was specifically tracked

### **2. Specific User Tracking**
- **Exact IDs**: Tracks specific MongoDB ObjectIds
- **Collection names**: Records exact collection locations
- **No broad queries**: Cannot accidentally match other users

### **3. Audit Trail**
- **Timestamped files**: All actions are timestamped
- **Archived records**: Duplicate files are preserved
- **Clear logging**: Every action is logged with details

### **4. Role Priority System**
- **Admin > Manager > User**: Clear hierarchy for conflicts
- **Preserves highest role**: Keeps the most privileged access
- **Clear reasoning**: Explains why each decision was made

## 🚨 **What the Old Script Did Wrong**

### **❌ Aggressive Deletion:**
```javascript
// OLD (UNSAFE) - Deletes ALL users with same email
await db.collection('regularUsers').deleteMany({ email });
```

### **✅ Safe Deletion:**
```javascript
// NEW (SAFE) - Deletes only specific tracked users
await db.collection(duplicateToRemove.collection).deleteOne({
  _id: duplicateToRemove._id
});
```

## 📞 **Emergency Recovery**

If you need to restore users after cleanup:

1. **Check archived files**: Look for `duplicate-users-YYYY-MM-DD.json`
2. **Use restore script**: `bun scripts/restore-users.mjs`
3. **Manual restoration**: Use the archived data to restore specific users

## 🎯 **Best Practices**

1. **Always scan first**: Never run cleanup without scanning
2. **Review the results**: Check `duplicate-users.json` before cleanup
3. **Test on staging**: Run on a test database first if possible
4. **Keep backups**: Ensure you have database backups before cleanup
5. **Monitor after cleanup**: Verify that legitimate users weren't affected

---

**Remember**: The new approach is designed to be safe and surgical. It will only remove users that were specifically identified as duplicates during the scan phase, preventing accidental deletion of legitimate users.
