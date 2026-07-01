/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  collection,
  doc,
  onSnapshot,
  setDoc,
  writeBatch,
  deleteDoc,
  getDocs,
} from "firebase/firestore";
import { db } from "./firebase";
import { Match, CommitteeMember, TeamAdjustment } from "./types";
import { INITIAL_MATCHES, INITIAL_COMMITTEE } from "./initialData";

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: null,
      email: null,
      emailVerified: null,
      isAnonymous: null,
      tenantId: null,
      providerInfo: []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Collection names
const MATCHES_COL = "matches";
const COMMITTEE_COL = "committee";
const SETTINGS_DOC = doc(db, "settings", "global");

/**
 * Initializes the Firestore database with default data if it is empty.
 */
export async function initializeDatabaseIfEmpty() {
  try {
    // 1. Initialize matches if empty
    let matchesSnap;
    try {
      matchesSnap = await getDocs(collection(db, MATCHES_COL));
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, MATCHES_COL);
    }

    if (matchesSnap.empty) {
      console.log("Firestore matches empty. Initializing...");
      const batch = writeBatch(db);
      for (const match of INITIAL_MATCHES) {
        const dRef = doc(db, MATCHES_COL, match.id);
        batch.set(dRef, match);
      }
      try {
        await batch.commit();
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, MATCHES_COL);
      }
    }

    // 2. Initialize committee if empty
    let committeeSnap;
    try {
      committeeSnap = await getDocs(collection(db, COMMITTEE_COL));
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, COMMITTEE_COL);
    }

    if (committeeSnap.empty) {
      console.log("Firestore committee empty. Initializing...");
      const batch = writeBatch(db);
      for (const m of INITIAL_COMMITTEE) {
        const dRef = doc(db, COMMITTEE_COL, m.id);
        batch.set(dRef, m);
      }
      try {
        await batch.commit();
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, COMMITTEE_COL);
      }
    }

    // 3. Initialize global settings if empty
    let settingsSnap;
    try {
      settingsSnap = await getDocs(collection(db, "settings"));
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, "settings");
    }

    if (settingsSnap.empty) {
      console.log("Firestore settings empty. Initializing...");
      try {
        await setDoc(SETTINGS_DOC, {
          activeMatchId: INITIAL_MATCHES[0].id,
          teamAdjustments: [],
        });
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, "settings/global");
      }
    }
  } catch (error) {
    console.error("Error initializing Firestore database:", error);
    throw error;
  }
}

/**
 * Listen to real-time changes in matches.
 */
export function subscribeMatches(onUpdate: (matches: Match[]) => void) {
  return onSnapshot(
    collection(db, MATCHES_COL),
    (snapshot) => {
      if (snapshot.empty) {
        // Database might be initializing or empty
        return;
      }
      const matches: Match[] = [];
      snapshot.forEach((doc) => {
        matches.push(doc.data() as Match);
      });
      // Sort matches by ID to keep the original schedule order (match-1, match-2...)
      matches.sort((a, b) => a.id.localeCompare(b.id));
      onUpdate(matches);
    },
    (err) => {
      handleFirestoreError(err, OperationType.GET, MATCHES_COL);
    }
  );
}

/**
 * Listen to real-time changes in committee members.
 */
export function subscribeCommittee(onUpdate: (committee: CommitteeMember[]) => void) {
  return onSnapshot(
    collection(db, COMMITTEE_COL),
    (snapshot) => {
      if (snapshot.empty) return;
      const committee: CommitteeMember[] = [];
      snapshot.forEach((doc) => {
        committee.push(doc.data() as CommitteeMember);
      });
      // Sort to preserve order or display consistently
      committee.sort((a, b) => a.id.localeCompare(b.id));
      onUpdate(committee);
    },
    (err) => {
      handleFirestoreError(err, OperationType.GET, COMMITTEE_COL);
    }
  );
}

/**
 * Listen to real-time changes in global settings.
 */
export function subscribeSettings(
  onUpdate: (activeMatchId: string, adjustments: TeamAdjustment[]) => void
) {
  return onSnapshot(
    SETTINGS_DOC,
    (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        const activeMatchId = data.activeMatchId || INITIAL_MATCHES[0].id;
        const teamAdjustments = data.teamAdjustments || [];
        onUpdate(activeMatchId, teamAdjustments);
      }
    },
    (err) => {
      handleFirestoreError(err, OperationType.GET, "settings/global");
    }
  );
}

/**
 * Save / update a single match in Firestore.
 */
export async function saveMatchToFirestore(match: Match) {
  try {
    const cleanMatch = JSON.parse(JSON.stringify(match));
    await setDoc(doc(db, MATCHES_COL, match.id), cleanMatch, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${MATCHES_COL}/${match.id}`);
  }
}

/**
 * Save / update multiple matches in Firestore.
 */
export async function saveMatchesToFirestore(matches: Match[]) {
  try {
    const batch = writeBatch(db);
    for (const match of matches) {
      const cleanMatch = JSON.parse(JSON.stringify(match));
      batch.set(doc(db, MATCHES_COL, match.id), cleanMatch, { merge: true });
    }
    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, MATCHES_COL);
  }
}

/**
 * Delete a match from Firestore.
 */
export async function deleteMatchFromFirestore(matchId: string) {
  try {
    await deleteDoc(doc(db, MATCHES_COL, matchId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${MATCHES_COL}/${matchId}`);
  }
}

/**
 * Save / update multiple committee members in Firestore.
 */
export async function saveCommitteeToFirestore(committee: CommitteeMember[]) {
  try {
    const batch = writeBatch(db);
    for (const member of committee) {
      const cleanMember = JSON.parse(JSON.stringify(member));
      batch.set(doc(db, COMMITTEE_COL, member.id), cleanMember, { merge: true });
    }
    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, COMMITTEE_COL);
  }
}

/**
 * Delete a committee member from Firestore.
 */
export async function deleteCommitteeFromFirestore(memberId: string) {
  try {
    await deleteDoc(doc(db, COMMITTEE_COL, memberId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${COMMITTEE_COL}/${memberId}`);
  }
}

/**
 * Save global settings.
 */
export async function saveSettingsToFirestore(
  activeMatchId: string,
  teamAdjustments: TeamAdjustment[]
) {
  try {
    await setDoc(SETTINGS_DOC, {
      activeMatchId,
      teamAdjustments,
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, "settings/global");
  }
}

/**
 * Resets Firestore database to default.
 */
export async function resetFirestoreDatabase() {
  try {
    // 1. Fetch current match docs and delete them
    let matchesSnap;
    try {
      matchesSnap = await getDocs(collection(db, MATCHES_COL));
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, MATCHES_COL);
    }

    const deleteBatch = writeBatch(db);
    matchesSnap.forEach((doc) => {
      deleteBatch.delete(doc.ref);
    });
    try {
      await deleteBatch.commit();
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, MATCHES_COL);
    }

    // 2. Fetch current committee docs and delete them
    let committeeSnap;
    try {
      committeeSnap = await getDocs(collection(db, COMMITTEE_COL));
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, COMMITTEE_COL);
    }

    const deleteCommitteeBatch = writeBatch(db);
    committeeSnap.forEach((doc) => {
      deleteCommitteeBatch.delete(doc.ref);
    });
    try {
      await deleteCommitteeBatch.commit();
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, COMMITTEE_COL);
    }

    // 3. Write default data back
    const initBatch = writeBatch(db);
    for (const match of INITIAL_MATCHES) {
      initBatch.set(doc(db, MATCHES_COL, match.id), match);
    }
    for (const m of INITIAL_COMMITTEE) {
      initBatch.set(doc(db, COMMITTEE_COL, m.id), m);
    }
    try {
      await initBatch.commit();
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, "initial_reset_write");
    }

    // 4. Reset global settings
    try {
      await setDoc(SETTINGS_DOC, {
        activeMatchId: INITIAL_MATCHES[0].id,
        teamAdjustments: [],
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, "settings/global");
    }

    console.log("Firestore database reset to defaults successfully.");
  } catch (error) {
    console.error("Error resetting Firestore database:", error);
    throw error;
  }
}
