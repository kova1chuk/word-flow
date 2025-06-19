# Word Flow

A Next.js application with Firebase authentication featuring email/password and Google sign-in options.

## Features

- 🔐 Firebase Authentication
- 📧 Email/Password Sign In & Sign Up
- 🌐 Google OAuth Sign In
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
```

5. Run the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Authentication Flow

- **Unauthenticated users**: See a welcome page with sign-in/sign-up options
- **Authenticated users**: See personalized content with user information
- **Header**: Shows authentication status and provides sign-out functionality

## Pages

- `/` - Main page showing auth status
- `/signin` - Sign in page with email/password and Google options
- `/signup` - Sign up page with email/password and Google options

## Tech Stack

- **Framework**: Next.js 15
- **Authentication**: Firebase Auth
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
│   ├── layout.tsx            # Root layout with AuthProvider
│   └── page.tsx              # Main page
├── components/
│   └── Header.tsx            # Header with auth buttons
└── lib/
    ├── auth-context.tsx      # Authentication context
    └── firebase.ts           # Firebase configuration
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
