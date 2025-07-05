const { initializeApp } = require("firebase/app");
const {
  getFirestore,
  collection,
  getDocs,
  doc,
  updateDoc,
  query,
  where,
} = require("firebase/firestore");

// Your Firebase config
const firebaseConfig = {
  // Add your Firebase config here
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Status mapping from old to new
const statusMapping = {
  to_learn: 1,
  want_repeat: 4,
  well_known: 6,
  unset: 1, // Default to "Not Learned"
};

async function migrateWordStatuses() {
  console.log("Starting word status migration...");

  try {
    // Get all words from the database
    const wordsRef = collection(db, "words");
    const wordsSnapshot = await getDocs(wordsRef);

    console.log(`Found ${wordsSnapshot.size} words to migrate`);

    let migratedCount = 0;
    let skippedCount = 0;

    for (const wordDoc of wordsSnapshot.docs) {
      const wordData = wordDoc.data();
      const oldStatus = wordData.status;

      // Skip if already migrated (numeric status)
      if (typeof oldStatus === "number") {
        console.log(
          `Skipping word "${wordData.word}" - already has numeric status: ${oldStatus}`
        );
        skippedCount++;
        continue;
      }

      // Map old status to new status
      const newStatus = statusMapping[oldStatus] || 1; // Default to 1 if unknown status

      console.log(
        `Migrating word "${wordData.word}": ${oldStatus} -> ${newStatus}`
      );

      // Update the word document
      await updateDoc(doc(db, "words", wordDoc.id), {
        status: newStatus,
        // Keep the old status for backward compatibility if needed
        oldStatus: oldStatus,
      });

      migratedCount++;
    }

    console.log(`Migration completed!`);
    console.log(`- Migrated: ${migratedCount} words`);
    console.log(`- Skipped: ${skippedCount} words (already numeric)`);
    console.log(`- Total processed: ${wordsSnapshot.size} words`);
  } catch (error) {
    console.error("Error during migration:", error);
    throw error;
  }
}

// Run the migration
migrateWordStatuses()
  .then(() => {
    console.log("Migration completed successfully!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Migration failed:", error);
    process.exit(1);
  });
