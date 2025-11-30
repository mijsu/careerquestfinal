
# CareerQuest Deployment Guide

## Prerequisites

1. **Firebase Account**: You need a Firebase project set up
2. **Judge0 RapidAPI Key**: For code execution features
3. **OpenAI API Key** (Optional): For AI study suggestions

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Firebase Configuration
FIREBASE_API_KEY=your_firebase_api_key
FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_STORAGE_BUCKET=your_project.appspot.com
FIREBASE_MESSAGING_SENDER_ID=your_sender_id
FIREBASE_APP_ID=your_app_id

# Judge0 RapidAPI
RAPIDAPI_KEY=your_rapidapi_key

# OpenAI (Optional)
OPENAI_API_KEY=your_openai_key

# Session Secret
SESSION_SECRET=your_random_secret_key_here
```

## Firestore Indexes

Run these commands to create required indexes:

```bash
# Deploy Firestore indexes
firebase deploy --only firestore:indexes
```

Or manually create indexes using the URLs provided in console errors.

## Initial Setup

1. **Install Dependencies**:
```bash
npm install
```

2. **Seed Database**:
```bash
# Seed career paths and badges
npm run seed

# Seed modules and lessons
npx tsx server/seed-modules.ts
```

3. **Create Admin User**:
After starting the app, register a user, then manually update in Firebase Console:
- Set `isAdmin: true` in the user document

## Running Locally

```bash
npm run dev
```

The app will be available at `http://localhost:5000`

## Deployment on Replit

1. **Fork this Repl**
2. **Add Secrets** in the Replit Secrets tool:
   - Add all environment variables listed above
3. **Deploy**:
   - Click the "Deploy" button in Replit
   - Follow the deployment wizard
   - Your app will be published with a public URL

## Post-Deployment Tasks

1. **Create Firestore Indexes**: Click the URLs in console errors to create required indexes
2. **Create Admin Account**: Register and manually set admin flag
3. **Test Features**:
   - User registration/login
   - Quiz taking
   - Code challenges
   - Daily challenges
   - Leaderboard

## Common Issues

### Missing Firestore Indexes
- Click the URLs in error messages to create indexes
- Or deploy `firestore.indexes.json` via Firebase CLI

### OpenAI Quota Exceeded
- System uses fallback suggestions when quota is exceeded
- Add credits to your OpenAI account or implement caching

### Judge0 Rate Limits
- Free tier has rate limits
- Upgrade to paid plan for production use

## Security Checklist

- [ ] Change SESSION_SECRET to a random string
- [ ] Enable Firebase Authentication email verification
- [ ] Set up Firestore security rules
- [ ] Enable CORS restrictions
- [ ] Set up rate limiting on API endpoints
- [ ] Review and restrict admin routes

## Monitoring

- Check Firebase Console for:
  - User analytics
  - Database usage
  - Error logs
- Monitor Replit logs for server errors
- Set up alerts for API quota limits
