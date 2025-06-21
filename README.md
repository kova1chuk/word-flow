# Word Flow

A Next.js application with Firebase authentication and Cloud Firestore for managing personal word collections.

## Features

- 🔐 Firebase Authentication
- 📧 Email/Password Sign In & Sign Up
- 🌐 Google OAuth Sign In
- 📚 Personal Word Collection Management
- 📊 Text Analysis & Word Recognition
- ☁️ Cloud Firestore Integration
- 🎨 Modern UI with Tailwind CSS
- 📱 Responsive Design
- ⚡ TypeScript Support

## Getting Started

### Prerequisites

- Node.js 18+ 
- Firebase project

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd word-flow
```

2. Install dependencies:
```bash
npm install
```

3. Set up Firebase:
   - Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
   - Enable Authentication with Email/Password and Google providers
   - Enable Cloud Firestore database
   - Get your Firebase config from Project Settings

4. Create a `.env.local` file in the root directory with your Firebase configuration:
```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id

# Optional: Custom backend URI for translation services
# If not set, defaults to https://libretranslate.de
BACKEND_URI=https://your-custom-translation-service.com

# Optional: Custom upload service URL for EPUB processing
# If not set, defaults to the current external service
UPLOAD_SERVICE_URL=https://your-custom-upload-service.com/upload/
```

5. **Backend Configuration (Optional)**:
   - The app uses LibreTranslate by default for word translations
   - You can set a custom `BACKEND_URI` in your `.env.local` file to use a different translation service
   - The custom backend should support the same API format as LibreTranslate:
     - POST `/translate` endpoint
     - Accepts JSON with `q`, `source`, `target`, and `format` fields
     - Returns JSON with `translatedText` field
   - If `BACKEND_URI` is not set, the app will use the default LibreTranslate service

6. **Upload Service Configuration (Optional)**:
   - The app uses an external service for EPUB file processing
   - You can set a custom `UPLOAD_SERVICE_URL` in your `.env.local` file to use a different upload service
   - The custom upload service should support:
     - POST `/upload/` endpoint
     - Accepts multipart form data with a `file` field
     - Returns JSON with `word_list`, `unique_words`, `sentences`, `total_words`, and `total_unique_words` fields
   - If `UPLOAD_SERVICE_URL` is not set, the app will use the default external service

7. Set up Firestore Security Rules:
   - In Firebase Console, go to Firestore Database
   - Navigate to Rules tab
   - Replace the default rules with the contents of `firestore.rules`

8. (Optional) Set up Firestore Indexes:
   - If you want to use server-side ordering, deploy the indexes from `firestore.indexes.json`
   - Currently, the app uses client-side sorting to avoid index requirements
   - To deploy indexes: `firebase deploy --only firestore:indexes`

9. Run the development server:
```bash
npm run dev
```

10. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Authentication Flow

- **Unauthenticated users**: See a welcome page with sign-in/sign-up options
- **Authenticated users**: See personalized content with user information and access to word management

## Word Management

- **Add Words**: Users can add new words with definitions and optional examples
- **View Words**: Personal word collection displayed in a responsive grid
- **Word Examples**: Each word card shows 2 examples from saved analyses
- **Word Details**: Click on any word to view its dedicated page with up to 20 examples
- **Delete Words**: Remove words from the collection
- **User Isolation**: Each user can only see and manage their own words

## Text Analysis

- **Text Input**: Paste or type any text for analysis
- **EPUB Upload**: Upload EPUB files for automatic text extraction and analysis
- **Word Statistics**: Count total words, unique words, known words, and unknown words
- **Word Recognition**: Automatically identifies which words are already in your collection
- **Bulk Add**: Add all unknown words to your collection with one click
- **Word Frequency**: Shows the most common words in the analyzed text
- **Real-time Analysis**: Instant results with visual statistics
- **Sentence Preview**: View sentences with unknown words highlighted
- **Save Analysis**: Save complete analysis with sentences to Firebase

## My Analyses

- **View Saved Analyses**: Browse all your saved text analyses
- **Sentence Browsing**: View all sentences from each analysis
- **Search & Filter**: Search sentences by content, filter by chapter, or unknown words
- **Enhanced Metadata**: Each sentence includes word count, chapter info, and unknown word detection
- **Analysis Statistics**: View summary statistics for each saved analysis

## Word Training

- **Status-based Training**: Train words based on their learning status
- **Card-based Interface**: One word at a time with definition and translation
- **Status Management**: Update word status during training
- **Reload Functions**: Refresh definitions and translations on demand
- **Progress Tracking**: Visual progress through training session

## Pages

- `/` - Main page showing auth status
- `/signin` - Sign in page with email/password and Google options
- `/signup` - Sign up page with email/password and Google options
- `/words` - Word management page (requires authentication)
- `/words/[word]` - Individual word page with examples (requires authentication)
- `/analyze` - Text analysis page (requires authentication)
- `/analyses` - My Analyses page to view saved analyses and sentences (requires authentication)
- `/training` - Word training page (requires authentication)

## Tech Stack

- **Framework**: Next.js 15
- **Authentication**: Firebase Auth
- **Database**: Cloud Firestore
- **Styling**: Tailwind CSS
- **Language**: TypeScript
- **State Management**: React Context

## Project Structure

```
src/
├── app/
│   ├── signin/
│   │   └── page.tsx          # Sign in page
│   ├── signup/
│   │   └── page.tsx          # Sign up page
│   ├── words/
│   │   └── page.tsx          # Word management page
│   ├── analyze/
│   │   └── page.tsx          # Text analysis page
│   ├── training/
│   │   └── page.tsx          # Word training page
│   ├── layout.tsx            # Root layout with AuthProvider
│   └── page.tsx              # Main page
├── components/
│   ├── Header.tsx            # Header with auth buttons and navigation
│   ├── WordCard.tsx          # Reusable word card component
│   └── WordTrainingCard.tsx  # Training-specific word card component
└── lib/
    ├── auth-context.tsx      # Authentication context
    ├── config.ts             # Environment configuration
    └── firebase.ts           # Firebase configuration
```

## Firestore Data Structure

```
words/
├── {wordId}/
│   ├── userId: string        # User ID (for security)
│   ├── word: string          # The word
│   ├── definition: string    # Word definition
│   ├── example: string       # Optional example sentence
│   └── createdAt: timestamp  # Creation timestamp
```

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
