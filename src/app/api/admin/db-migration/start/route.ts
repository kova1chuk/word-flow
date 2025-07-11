
import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

import { NextResponse } from "next/server";

const projectId = process.env.FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_PRIVATE_KEY;

if (!projectId || !clientEmail || !privateKey) {
  throw new Error("Missing required Firebase Admin environment variables");
}

if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId,
      clientEmail,
      privateKey: privateKey.replace(/\\n/g, "\n"),
    }),
  });
}

const db = getFirestore();

export async function POST() {
  // Set initial progress for all steps
  await db
    .collection("migration_progress")
    .doc("db_migration")
    .set({
      status: "running",
      currentStep: 1,
      steps: [
        {
          name: "Clean Up Old Structure",
          status: "pending",
          processed: 0,
          total: 0,
        },
        {
          name: "Rebuild wordStats in Analyses",
          status: "pending",
          processed: 0,
          total: 0,
        },
        {
          name: "Update User wordStats",
          status: "pending",
          processed: 0,
          total: 0,
        },
        {
          name: "Enable Real-Time Updates",
          status: "pending",
          processed: 0,
          total: 0,
        },
        {
          name: "Enrich words with analyses info",
          status: "pending",
          processed: 0,
          total: 0,
        },
      ],
      error: null,
    });

  // Start migration in background
  runStepwiseMigration();

  return NextResponse.json({ started: true });
}

async function runStepwiseMigration() {
  // TODO: Implement each step and update Firestore progress after each batch/item
  // For now, just simulate progress
  const statusDoc = db.collection("migration_progress").doc("db_migration");
  const steps = [
    "Clean Up Old Structure",
    "Rebuild wordStats in Analyses",
    "Update User wordStats",
    "Enable Real-Time Updates",
    "Enrich words with analyses info",
  ];
  for (let i = 0; i < steps.length; i++) {
    await statusDoc.update({
      currentStep: i + 1,
      [`steps.${i}.status`]: "running",
    });
    // Simulate work
    for (let j = 1; j <= 10; j++) {
      await new Promise((resolve) => setTimeout(resolve, 300));
      await statusDoc.update({
        [`steps.${i}.processed`]: j,
        [`steps.${i}.total`]: 10,
      });
    }
    await statusDoc.update({ [`steps.${i}.status`]: "completed" });
  }
  await statusDoc.update({ status: "completed" });
}
