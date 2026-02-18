import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "./firebase";
import { DailyLog, TaskLine } from "./types";

export interface UserData {
  sessions: DailyLog;
  tasks: TaskLine[];
}

/**
 * Load a user's sessions and task list from Firestore.
 * Returns null if the user has no data stored yet.
 */
export async function loadUserData(uid: string): Promise<UserData | null> {
  try {
    const ref = doc(db, "users", uid);
    const snap = await getDoc(ref);
    if (!snap.exists()) return null;
    return snap.data() as UserData;
  } catch (err) {
    console.error("Failed to load user data from Firestore:", err);
    return null;
  }
}

/**
 * Save (merge) a user's data to Firestore.
 * Pass only the fields you want to update (sessions, tasks, or both).
 */
export async function saveUserData(
  uid: string,
  data: Partial<UserData>
): Promise<void> {
  try {
    const ref = doc(db, "users", uid);
    await setDoc(ref, data, { merge: true });
  } catch (err) {
    console.error("Failed to save user data to Firestore:", err);
  }
}
