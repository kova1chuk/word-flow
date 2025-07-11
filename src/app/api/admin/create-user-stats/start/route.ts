
import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getAuth, UserRecord } from "firebase-admin/auth";
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
const auth = getAuth();

async function listAllUsers() {
  let users: UserRecord[] = [];
  let result = await auth.listUsers(1000);
  users = users.concat(result.users);
  while (result.pageToken) {
    result = await auth.listUsers(1000, result.pageToken);
    users = users.concat(result.users);
  }
  return users;
}

export async function POST() {
  try {
    // Get all Auth users
    const users = await listAllUsers();
    let processed = 0;
    for (const user of users) {
      const userId = user.uid;

      // Use getCountFromServer for efficient counting
      const wordStats: Record<number, number> = {
        1: 0,
        2: 0,
        3: 0,
        4: 0,
        5: 0,
        6: 0,
        7: 0,
      };

      // Count words by status using getCountFromServer
      for (let status = 1; status <= 7; status++) {
        const statusQuery = db
          .collection("words")
          .where("userId", "==", userId)
          .where("status", "==", status);
        const statusSnapshot = await statusQuery.count().get();
        wordStats[status] = statusSnapshot.data().count;
      }

      await db.collection("userStats").doc(userId).set({ wordStats });
      processed++;
    }
    return NextResponse.json({ success: true, processed });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
