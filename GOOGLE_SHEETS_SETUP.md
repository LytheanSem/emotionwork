# Google Sheets API Setup Guide

This guide will help you set up the Google Sheets API credentials for a new Google account.

## Required Environment Variables

You need to set these three environment variables in your `.env` file:

- `GOOGLE_SHEET_ID` - The ID of your Google Spreadsheet
- `GOOGLE_SERVICE_ACCOUNT_EMAIL` - The email address of your service account
- `GOOGLE_PRIVATE_KEY` - The private key from your service account JSON file

## Step-by-Step Instructions

### Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Sign in with your new Google account
3. Click on the project dropdown at the top
4. Click **"New Project"**
5. Enter a project name (e.g., "Emotionwork Sheets API")
6. Click **"Create"**
7. Wait for the project to be created and select it

### Step 2: Enable Google Sheets API

1. In the Google Cloud Console, go to **"APIs & Services"** > **"Library"**
2. Search for **"Google Sheets API"**
3. Click on it and click **"Enable"**
4. Wait for the API to be enabled

### Step 3: Create a Service Account

1. Go to **"APIs & Services"** > **"Credentials"**
2. Click **"Create Credentials"** > **"Service Account"**
3. Fill in the details:
   - **Service account name**: `emotionwork-sheets-service` (or any name you prefer)
   - **Service account ID**: Will be auto-generated
   - **Description**: (Optional) "Service account for Google Sheets integration"
4. Click **"Create and Continue"**
5. Skip the optional steps (Grant access, Grant users access) and click **"Done"**

### Step 4: Create and Download Service Account Key

1. In the **"Credentials"** page, find your newly created service account
2. Click on the service account email address
3. Go to the **"Keys"** tab
4. Click **"Add Key"** > **"Create new key"**
5. Select **"JSON"** format
6. Click **"Create"**
7. A JSON file will be downloaded automatically - **SAVE THIS FILE SECURELY** (you'll need it)

### Step 5: Extract Credentials from JSON File

Open the downloaded JSON file. It will look like this:

```json
{
  "type": "service_account",
  "project_id": "your-project-id",
  "private_key_id": "...",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
  "client_email": "your-service-account@your-project.iam.gserviceaccount.com",
  "client_id": "...",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  ...
}
```

From this file, extract:

- **`client_email`** → This is your `GOOGLE_SERVICE_ACCOUNT_EMAIL`
- **`private_key`** → This is your `GOOGLE_PRIVATE_KEY` (keep the entire key including `-----BEGIN PRIVATE KEY-----` and `-----END PRIVATE KEY-----`)

### Step 6: Create or Get Your Google Sheet ID

1. Go to [Google Sheets](https://sheets.google.com/)
2. Create a new spreadsheet or open an existing one
3. Look at the URL in your browser. It will look like:
   ```
   https://docs.google.com/spreadsheets/d/SPREADSHEET_ID_HERE/edit
   ```
4. Copy the `SPREADSHEET_ID_HERE` part - this is your `GOOGLE_SHEET_ID`

### Step 7: Share the Sheet with Service Account

**IMPORTANT:** The service account needs access to your spreadsheet!

1. Open your Google Sheet
2. Click the **"Share"** button (top right)
3. In the "Add people and groups" field, paste your **service account email** (the `client_email` from Step 5)
4. Set permission to **"Editor"** (or at least "Viewer" if you only need read access)
5. **Uncheck** "Notify people" (service accounts don't need notifications)
6. Click **"Share"**

### Step 8: Add Credentials to .env File

Add these three lines to your `.env` file:

```env
GOOGLE_SHEET_ID=your-spreadsheet-id-here
GOOGLE_SERVICE_ACCOUNT_EMAIL=your-service-account@your-project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour\nPrivate\nKey\nHere\n-----END PRIVATE KEY-----\n"
```

**Important Notes:**

- The `GOOGLE_PRIVATE_KEY` must be wrapped in quotes
- Keep the `\n` characters in the private key (they represent newlines)
- The private key should include the `-----BEGIN PRIVATE KEY-----` and `-----END PRIVATE KEY-----` lines
- If your private key has actual newlines, you can format it like this:
  ```env
  GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----
  Your
  Private
  Key
  Here
  -----END PRIVATE KEY-----"
  ```

### Step 9: Verify Setup

Restart your development server and check the console logs. You should see:

```
Google Sheets Service initialized successfully
- Spreadsheet ID: Set
- Service Account Email: Set
- Private Key: Set
```

## Troubleshooting

### Error: "The caller does not have permission"

- Make sure you shared the Google Sheet with the service account email (Step 7)
- The service account email must have at least "Viewer" access

### Error: "GOOGLE_PRIVATE_KEY environment variable is required"

- Check that the private key is properly formatted in your `.env` file
- Make sure it's wrapped in quotes
- Verify there are no extra spaces or line breaks

### Error: "Invalid credentials"

- Double-check that you copied the `client_email` and `private_key` correctly from the JSON file
- Make sure the Google Sheets API is enabled in your Google Cloud project

## Security Best Practices

1. **Never commit your `.env` file to git** - It should already be in `.gitignore`
2. **Never share your service account JSON file** - Treat it like a password
3. **Delete old service account keys** if you regenerate them
4. **Use different service accounts** for different environments (dev, staging, production)

## Additional Resources

- [Google Sheets API Documentation](https://developers.google.com/sheets/api)
- [Service Account Authentication](https://cloud.google.com/iam/docs/service-accounts)
- [Google Cloud Console](https://console.cloud.google.com/)
