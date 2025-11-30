# Firebase Firestore Setup Guide

## Step 1: Enable Firestore Database

1. **Visit Firebase Console:**
   - Go to: https://console.firebase.google.com/project/careerquest-7a741/firestore
   - Sign in with your Google account

2. **Create Firestore Database:**
   - Click "Create database" button
   - Choose **Production mode** (we'll set custom rules next)
   - Select a location (choose closest to you):
     - `us-central1` (Iowa, USA)
     - `us-east1` (South Carolina, USA)
     - `europe-west1` (Belgium)
     - `asia-northeast1` (Tokyo, Japan)
   - Click "Enable"

3. **Configure Firestore Rules** (Development Mode):
   - After database is created, go to the "Rules" tab
   - Replace the rules with:
   ```
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /{document=**} {
         allow read, write: if true;
       }
     }
   }
   ```
   - Click "Publish"
   
   ⚠️ **Important**: These permissive rules are ONLY for development. For production, implement proper authentication-based rules.

## Step 2: Run Database Seeding Script

After Firestore is enabled, run the seed script to populate initial data:

```bash
tsx server/seed-firestore.ts
```

This will create:
- **2 Test Users:**
  - Student: `test@careerquest.com` / `password123`
  - Admin: `admin@careerquest.com` / `admin123`
  
- **5 Career Paths:**
  - Full Stack Development
  - Data Science & AI
  - Cloud & DevOps
  - Mobile Development
  - Cybersecurity

- **5 Badges:**
  - First Steps (Common)
  - Code Warrior (Rare)
  - AI Explorer (Epic)
  - System Architect (Epic)
  - Cyber Sentinel (Legendary)

- **Sample Quizzes & Questions:**
  - Frontend fundamentals
  - Backend concepts
  - Data structures
  - Security basics

- **Code Challenges:**
  - FizzBuzz (Easy)
  - Two Sum (Medium)
  - Reverse String (Easy)

## Step 3: Verify Setup

1. **Check Firebase Console:**
   - Go to Firestore Data tab
   - You should see collections: `users`, `careerPaths`, `badges`, `quizzes`, `questions`, `codeChallenges`

2. **Test Login:**
   - Visit your app's landing page
   - Click "Sign Up" or "Log In"
   - Use test credentials: `test@careerquest.com` / `password123`
   - You should be redirected to the dashboard

## Troubleshooting

**Error: "Firestore API has not been used"**
- Wait 2-3 minutes after enabling Firestore for the API to fully activate
- Try running the seed script again

**Error: "PERMISSION_DENIED"**
- Check that you published the development rules
- Verify rules show `allow read, write: if true;`

**No data showing after seeding:**
- Check the seed script output for errors
- Verify your Firebase project ID matches in `.env` or environment variables
