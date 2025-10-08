import { db } from './firebase';
import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy,
  limit,
  Timestamp 
} from 'firebase/firestore';

// Firestore collections
export const COLLECTIONS = {
  PROFILES: 'profiles',
  DAILY_ACTIVITIES: 'daily_activities',
  MOOD_ENTRIES: 'mood_entries',
  PRAYERS: 'prayers',
  DREAMS: 'dreams',
  QUIZ_SESSIONS: 'quiz_sessions',
  USER_QUIZ_STATS: 'user_quiz_stats',
  NOTES: 'notes'
} as const;

export class FirestoreService {
  /**
   * Get all documents from a collection for a specific user
   */
  static async getByUserId<T>(collectionName: string, userId: string): Promise<T[]> {
    try {
      const q = query(
        collection(db, collectionName),
        where('user_id', '==', userId)
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as T));
    } catch (error) {
      console.error(`Error getting documents from ${collectionName}:`, error);
      return [];
    }
  }

  /**
   * Get a single document by ID
   */
  static async getById<T>(collectionName: string, docId: string): Promise<T | null> {
    try {
      const docRef = doc(db, collectionName, docId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as T;
      }
      return null;
    } catch (error) {
      console.error(`Error getting document ${docId} from ${collectionName}:`, error);
      return null;
    }
  }

  /**
   * Create or update a document
   */
  static async set<T extends { id?: string }>(collectionName: string, data: T): Promise<string> {
    try {
      let docRef;
      if (data.id) {
        docRef = doc(db, collectionName, data.id);
        await updateDoc(docRef, { ...data, updated_at: Timestamp.now() });
      } else {
        docRef = doc(collection(db, collectionName));
        await setDoc(docRef, { ...data, created_at: Timestamp.now(), updated_at: Timestamp.now() });
      }
      return docRef.id;
    } catch (error) {
      console.error(`Error setting document in ${collectionName}:`, error);
      throw error;
    }
  }

  /**
   * Delete a document
   */
  static async delete(collectionName: string, docId: string): Promise<void> {
    try {
      const docRef = doc(db, collectionName, docId);
      await deleteDoc(docRef);
    } catch (error) {
      console.error(`Error deleting document ${docId} from ${collectionName}:`, error);
      throw error;
    }
  }

  /**
   * Get documents with ordering and limiting
   */
  static async getWithOptions<T>(
    collectionName: string, 
    userId: string, 
    options: { 
      orderByField?: string, 
      orderDirection?: 'asc' | 'desc', 
      limitCount?: number 
    } = {}
  ): Promise<T[]> {
    try {
      let q = query(
        collection(db, collectionName),
        where('user_id', '==', userId)
      );

      if (options.orderByField) {
        q = query(q, orderBy(options.orderByField, options.orderDirection || 'desc'));
      }

      if (options.limitCount) {
        q = query(q, limit(options.limitCount));
      }

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as T));
    } catch (error) {
      console.error(`Error getting documents from ${collectionName} with options:`, error);
      return [];
    }
  }
}