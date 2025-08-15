# Email Verification System

This document explains how the new email verification system works in EmotionWork.

## Overview

The email verification system adds an extra layer of security to user registration by requiring users to verify their email address with a 6-digit code before their account is created.

## How It Works

### 1. User Registration Flow

1. User fills out the sign-up form (username, email, password)
2. System sends a 6-digit verification code to the user's email
3. User is redirected to the verification page
4. User enters the 6-digit code
5. If code is valid, account is created and user is logged in
6. If code is invalid/expired, user can request a new code

### 2. Security Features

- Verification codes expire after 10 minutes
- Codes can only be used once
- Codes are stored securely in the database
- Email addresses are verified before account creation

## New Files Created

### Collections

- `src/collections/VerificationCodes.ts` - Stores temporary verification codes

### API Routes

- `src/app/(app)/(home)/api/auth/send-verification/route.ts` - Sends verification codes
- `src/app/(app)/(home)/api/auth/verify-code/route.ts` - Verifies codes and creates accounts

### Components

- `src/modules/auth/ui/views/verification-view.tsx` - UI for entering verification codes
- `src/app/(app)/(home)/verify-email/page.tsx` - Verification page route

### Utilities

- `src/lib/email.ts` - Email sending functionality

## Environment Variables Required

Add these to your `.env` file:

```bash
# Email Configuration (for Gmail)
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password-here
```

### Gmail Setup Instructions

1. Enable 2-factor authentication on your Gmail account
2. Generate an App Password (Google Account → Security → App Passwords)
3. Use the App Password instead of your regular Gmail password

## Database Changes

### Users Collection

- Added `emailVerified` field (boolean)
- Added `emailVerifiedAt` field (date)

### VerificationCodes Collection

- `email` - User's email address
- `code` - 6-digit verification code
- `expiresAt` - When the code expires
- `used` - Whether the code has been used
- `timestamps` - Created/updated timestamps

## API Endpoints

### POST /api/auth/send-verification

Sends a verification code to the user's email.

**Request Body:**

```json
{
  "email": "user@example.com",
  "username": "username"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Verification code sent successfully"
}
```

### POST /api/auth/verify-code

Verifies the code and creates the user account.

**Request Body:**

```json
{
  "email": "user@example.com",
  "username": "username",
  "password": "password",
  "code": "123456"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Account verified and created successfully",
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "username": "username"
  }
}
```

## Testing

To test the system:

1. Set up your environment variables
2. Start the development server
3. Go to the sign-up page
4. Fill out the form and submit
5. Check your email for the verification code
6. Enter the code on the verification page
7. Verify that the account is created and you're logged in

## Troubleshooting

### Email Not Sending

- Check that `EMAIL_USER` and `EMAIL_PASS` are set correctly
- Ensure you're using an App Password for Gmail
- Check the console for error messages

### Verification Code Not Working

- Codes expire after 10 minutes
- Codes can only be used once
- Check that the code matches exactly (6 digits)

### Database Issues

- Run `bun run generate:types` to regenerate PayloadCMS types
- Ensure the new collections are properly added to `payload.config.ts`

## Future Enhancements

- Add rate limiting for code requests
- Implement SMS verification as an alternative
- Add email templates for different types of emails
- Implement account recovery via email verification
