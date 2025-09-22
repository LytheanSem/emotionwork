# 🚨 Quick Fix for Cloudinary Errors

## ❌ **Current Errors:**

1. **File Type Error**: PDF files not allowed
2. **API Key Error**: `Unknown API key your-secondary-api-key`

## ✅ **Solutions:**

### **1. File Type Error - FIXED!**
✅ I've updated the file validation to allow:
- **Images**: JPG, PNG, GIF, WebP, SVG
- **Videos**: MP4, WebM, AVI, MOV, etc.
- **Documents**: PDF, DOC, DOCX, PPT, PPTX, XLS, XLSX, TXT, CSV
- **Archives**: ZIP, RAR, 7Z

### **2. API Key Error - NEEDS YOUR ACTION**

You need to replace the placeholder values in your `.env` file with your actual Cloudinary credentials.

**Current (WRONG):**
```bash
CLOUDINARY_SECONDARY_CLOUD_NAME=your-secondary-cloud-name
CLOUDINARY_SECONDARY_API_KEY=your-secondary-api-key
CLOUDINARY_SECONDARY_API_SECRET=your-secondary-api-secret
```

**Should be (REPLACE WITH YOUR ACTUAL VALUES):**
```bash
CLOUDINARY_SECONDARY_CLOUD_NAME=dniopqmnf
CLOUDINARY_SECONDARY_API_KEY=123456789012345
CLOUDINARY_SECONDARY_API_SECRET=abcdefghijklmnopqrstuvwxyz1234567890
```

## 🔧 **How to Get Your Cloudinary Credentials:**

1. **Go to**: [https://cloudinary.com/](https://cloudinary.com/)
2. **Sign in** to your account
3. **Go to Dashboard**
4. **Copy your credentials**:
   - Cloud Name
   - API Key  
   - API Secret

## 📝 **Your .env File Should Look Like:**

```bash
# Database
DATABASE_URI=mongodb://localhost:27017/emotionwork

# NextAuth.js
NEXTAUTH_SECRET=your-secret-key-here
NEXTAUTH_URL=http://localhost:3000

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Primary Cloudinary (working - dniopqmnf)
CLOUDINARY_CLOUD_NAME=dniopqmnf
CLOUDINARY_API_KEY=your-main-api-key
CLOUDINARY_API_SECRET=your-main-api-secret

# Secondary Cloudinary (for stage bookings) - REPLACE THESE!
CLOUDINARY_SECONDARY_CLOUD_NAME=your-actual-secondary-cloud-name
CLOUDINARY_SECONDARY_API_KEY=your-actual-secondary-api-key
CLOUDINARY_SECONDARY_API_SECRET=your-actual-secondary-api-secret
CLOUDINARY_SECONDARY_FOLDER=stage-bookings
```

## 🚀 **After Fixing:**

1. **Save your `.env` file**
2. **Restart the dev server**: `bun run dev`
3. **Test the stage booking form**
4. **Upload a PDF file** - should work now!

## 🎯 **Quick Test:**

1. Go to: `http://localhost:3000/book-stage`
2. Sign in with Google
3. Upload a PDF file
4. Should work without errors!

---

**The file type error is already fixed! You just need to update your Cloudinary credentials in the `.env` file.** 🎉

