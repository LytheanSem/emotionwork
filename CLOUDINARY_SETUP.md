# 🌟 Multiple Cloudinary Configurations Setup Guide

## 📋 **Complete .env Configuration Example**

Here's how to set up multiple Cloudinary configurations in your `.env` file:

```bash
# ===========================================
# DATABASE CONFIGURATION
# ===========================================
DATABASE_URI=mongodb://localhost:27017/emotionwork

# ===========================================
# NEXTAUTH CONFIGURATION
# ===========================================
NEXTAUTH_SECRET=your-secret-key-here
NEXTAUTH_URL=http://localhost:3000

# ===========================================
# GOOGLE OAUTH CONFIGURATION
# ===========================================
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# ===========================================
# PRIMARY CLOUDINARY CONFIGURATION
# ===========================================
# Main account for stage bookings and general uploads
CLOUDINARY_CLOUD_NAME=your-main-cloud-name
CLOUDINARY_API_KEY=your-main-api-key
CLOUDINARY_API_SECRET=your-main-api-secret
CLOUDINARY_PRIMARY_FOLDER=stage-designs

# ===========================================
# SECONDARY CLOUDINARY CONFIGURATION
# ===========================================
# Secondary account specifically for stage bookings
CLOUDINARY_SECONDARY_CLOUD_NAME=your-secondary-cloud-name
CLOUDINARY_SECONDARY_API_KEY=your-secondary-api-key
CLOUDINARY_SECONDARY_API_SECRET=your-secondary-api-secret
CLOUDINARY_SECONDARY_FOLDER=stage-bookings

# ===========================================
# DEVELOPMENT CLOUDINARY CONFIGURATION
# ===========================================
# Development account for testing
CLOUDINARY_DEV_CLOUD_NAME=your-dev-cloud-name
CLOUDINARY_DEV_API_KEY=your-dev-api-key
CLOUDINARY_DEV_API_SECRET=your-dev-api-secret
CLOUDINARY_DEV_FOLDER=dev-uploads

# ===========================================
# ADDITIONAL FOLDER CONFIGURATIONS
# ===========================================
# You can also just use different folders with the same account
CLOUDINARY_PORTFOLIO_FOLDER=portfolio-images
CLOUDINARY_USER_FOLDER=user-uploads
CLOUDINARY_TEMP_FOLDER=temp-uploads
```

## 🚀 **How to Use Multiple Configurations**

### **1. Stage Booking (Secondary Account) - DEFAULT**
```typescript
// Stage bookings automatically use secondary configuration
const result = await stageBookingCloudinaryService.uploadFile(file, {
  folder: 'stage-designs',
  tags: ['stage-booking', 'design', 'secondary']
});
```

### **2. Basic Usage (Primary Account)**
```typescript
// Uses primary configuration by default
const result = await cloudinaryService.uploadFile(file, {
  folder: 'equipment-images',
  tags: ['equipment', 'catalog']
});
```

### **3. Using Specific Configuration**
```typescript
// Upload to secondary account (stage bookings)
const result = await cloudinaryService.uploadFileWithConfig(file, 'secondary', {
  folder: 'stage-designs',
  tags: ['stage-booking', 'design']
});

// Upload to development account
const result = await cloudinaryService.uploadFileWithConfig(file, 'dev', {
  folder: 'dev-uploads',
  tags: ['test', 'development']
});
```

### **3. API Usage with Different Configurations**
```typescript
// Upload to primary account
const formData = new FormData();
formData.append('files', file);
formData.append('config', 'primary');
formData.append('folder', 'stage-designs');
formData.append('tags', 'stage-booking,design');

// Upload to secondary account
const formData2 = new FormData();
formData2.append('files', file);
formData2.append('config', 'secondary');
formData2.append('folder', 'equipment-images');
formData2.append('tags', 'equipment,catalog');
```

## 🔧 **Configuration Options**

### **Option 1: Multiple Accounts (Recommended)**
- **Primary**: Main production account for stage bookings
- **Secondary**: Separate account for equipment, portfolio
- **Development**: Testing account for development

### **Option 2: Single Account, Multiple Folders**
```bash
# Just use one account with different folders
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Different folders
CLOUDINARY_PRIMARY_FOLDER=stage-designs
CLOUDINARY_SECONDARY_FOLDER=stage-bookings
CLOUDINARY_EQUIPMENT_FOLDER=equipment-images
CLOUDINARY_PORTFOLIO_FOLDER=portfolio-images
```

### **Option 3: Environment-Based**
```bash
# Development
CLOUDINARY_DEV_CLOUD_NAME=dev-cloud-name
CLOUDINARY_DEV_API_KEY=dev-api-key
CLOUDINARY_DEV_API_SECRET=dev-api-secret

# Production
CLOUDINARY_PROD_CLOUD_NAME=prod-cloud-name
CLOUDINARY_PROD_API_KEY=prod-api-key
CLOUDINARY_PROD_API_SECRET=prod-api-secret
```

## 📁 **Folder Organization Examples**

### **Stage Bookings**
- `stage-designs/` - Design files and blueprints
- `stage-photos/` - Reference images
- `stage-documents/` - Contracts and specifications

### **Equipment Management**
- `equipment-images/` - Equipment photos
- `equipment-manuals/` - PDF manuals
- `equipment-certificates/` - Safety certificates

### **Portfolio**
- `portfolio-images/` - Project photos
- `portfolio-videos/` - Project videos
- `portfolio-documents/` - Project documentation

## 🔍 **Testing Your Configuration**

### **1. Check Available Configurations**
```bash
curl -X GET http://localhost:3000/api/cloudinary/configs
```

### **2. Test Upload with Specific Configuration**
```bash
curl -X POST http://localhost:3000/api/cloudinary/upload \
  -F "files=@test-image.jpg" \
  -F "config=primary" \
  -F "folder=stage-designs" \
  -F "tags=test,upload"
```

## 🛠️ **Troubleshooting**

### **Common Issues:**

1. **Configuration Not Found**
   - Check if environment variables are set correctly
   - Verify the configuration name matches exactly

2. **Upload Fails**
   - Check API credentials
   - Verify folder permissions
   - Check file size limits

3. **Wrong Account Used**
   - Verify the `config` parameter in API calls
   - Check which configuration is set as default

### **Debug Commands:**
```typescript
// Check available configurations
console.log(cloudinaryService.getAvailableConfigs());

// Switch configuration manually
cloudinaryService.switchConfig('secondary');

// Test upload with specific config
const result = await cloudinaryService.uploadFileWithConfig(file, 'primary');
```

## 🎯 **Best Practices**

1. **Use Descriptive Names**: `primary`, `secondary`, `dev`, `staging`
2. **Organize by Purpose**: Stage bookings, equipment, portfolio
3. **Set Appropriate Folders**: Use meaningful folder names
4. **Tag Your Uploads**: Use consistent tagging for organization
5. **Monitor Usage**: Check Cloudinary dashboard for usage statistics

## 📊 **Example Use Cases**

### **Stage Booking System (Your Setup)**
- **Secondary Account**: `stage-designs/` folder
- **Tags**: `stage-booking`, `design`, `secondary`
- **Configuration**: `CLOUDINARY_SECONDARY_*` variables
- **Usage**: Automatically used for all stage booking uploads

### **Equipment Management**
- **Primary Account**: `equipment-images/` folder
- **Tags**: `equipment`, `catalog`, `inventory`

### **Portfolio Management**
- **Primary Account**: `portfolio-images/` folder
- **Tags**: `portfolio`, `project`, `gallery`

### **Development Testing**
- **Dev Account**: `dev-uploads/` folder
- **Tags**: `test`, `development`, `debug`

## 🎯 **Your Specific Configuration**

Based on your setup, here's what you need in your `.env` file:

```bash
# Primary Cloudinary (for general use)
CLOUDINARY_CLOUD_NAME=your-main-cloud-name
CLOUDINARY_API_KEY=your-main-api-key
CLOUDINARY_API_SECRET=your-main-api-secret

# Secondary Cloudinary (for stage bookings)
CLOUDINARY_SECONDARY_CLOUD_NAME=your-secondary-cloud-name
CLOUDINARY_SECONDARY_API_KEY=your-secondary-api-key
CLOUDINARY_SECONDARY_API_SECRET=your-secondary-api-secret
CLOUDINARY_SECONDARY_FOLDER=stage-bookings
```

**How it works:**
1. ✅ Stage booking form automatically uses `secondary` configuration
2. ✅ Files are uploaded to `stage-designs/` folder in your secondary account
3. ✅ Files are tagged with `stage-booking`, `design`, `secondary`
4. ✅ All other features use the primary configuration

---

## 🎉 **You're All Set!**

With multiple Cloudinary configurations, you can:
- ✅ Organize uploads by purpose
- ✅ Use different accounts for different features
- ✅ Separate development and production uploads
- ✅ Scale your file management system
- ✅ Maintain better security and organization

Your stage booking system now supports flexible file upload management! 🚀
