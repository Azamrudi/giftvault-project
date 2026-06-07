import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  collection, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit, 
  getDocFromServer 
} from 'firebase/firestore';
import { db, OperationType, handleFirestoreError } from '../firebase';
import { UserProfile, BirthdayPage, FriendContribution, GuestbookEntry } from '../types';

// Connection validator - called at initialization to confirm backend status
export async function testFirestoreConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('offline')) {
      console.error("Please check your Firestore database configuration.");
    }
  }
}

// 1. User Profile CRUD
export async function saveUserProfile(profile: UserProfile): Promise<void> {
  const path = `users/${profile.uid}`;
  try {
    await setDoc(doc(db, 'users', profile.uid), profile);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// 2. Birthday Pages CRUD
export async function createBirthdayPage(page: BirthdayPage): Promise<void> {
  const path = `birthdayPages/${page.id}`;
  try {
    await setDoc(doc(db, 'birthdayPages', page.id), page);
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function getBirthdayPage(id: string): Promise<BirthdayPage | null> {
  const path = `birthdayPages/${id}`;
  try {
    const docRef = doc(db, 'birthdayPages', id);
    const snap = await getDoc(docRef);
    if (!snap.exists()) return null;
    return snap.data() as BirthdayPage;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

export async function updateBirthdayPage(page: BirthdayPage): Promise<void> {
  const path = `birthdayPages/${page.id}`;
  try {
    await setDoc(doc(db, 'birthdayPages', page.id), page);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function incrementOpenedCount(id: string, currentCount: number): Promise<void> {
  const path = `birthdayPages/${id}`;
  try {
    await updateDoc(doc(db, 'birthdayPages', id), {
      openedCount: currentCount + 1,
      lastOpened: new Date().toISOString()
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function deleteBirthdayPageDocument(id: string): Promise<void> {
  const path = `birthdayPages/${id}`;
  try {
    await deleteDoc(doc(db, 'birthdayPages', id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function getCreatorBirthdayPages(uid: string): Promise<BirthdayPage[]> {
  const path = 'birthdayPages';
  try {
    const q = query(
      collection(db, 'birthdayPages'),
      where('creatorUid', '==', uid)
    );
    const snap = await getDocs(q);
    const results: BirthdayPage[] = [];
    snap.forEach((d) => {
      results.push(d.data() as BirthdayPage);
    });
    return results;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

export async function getAllPublicBirthdayPages(): Promise<BirthdayPage[]> {
  const path = 'birthdayPages';
  try {
    const q = query(
      collection(db, 'birthdayPages'),
      where('visibility', 'in', ['public', 'semi-private']),
      limit(50)
    );
    const snap = await getDocs(q);
    const results: BirthdayPage[] = [];
    snap.forEach((d) => {
      results.push(d.data() as BirthdayPage);
    });
    return results;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

// 3. Friend Contributions (memories added before birthday)
export async function getFriendContributions(pageId: string): Promise<FriendContribution[]> {
  const path = 'friendContributions';
  try {
    const q = query(
      collection(db, 'friendContributions'),
      where('pageId', '==', pageId)
    );
    const snap = await getDocs(q);
    const results: FriendContribution[] = [];
    snap.forEach((d) => {
      results.push(d.data() as FriendContribution);
    });
    return results.sort((a,b) => b.createdAt.localeCompare(a.createdAt));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

export async function addFriendContribution(contribution: FriendContribution): Promise<void> {
  const path = `friendContributions/${contribution.id}`;
  try {
    await setDoc(doc(db, 'friendContributions', contribution.id), contribution);
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

// 4. Guestbook Entries (unlocked greetings added post birthday)
export async function getGuestbookEntries(pageId: string): Promise<GuestbookEntry[]> {
  const path = 'guestbook';
  try {
    const q = query(
      collection(db, 'guestbook'),
      where('pageId', '==', pageId)
    );
    const snap = await getDocs(q);
    const results: GuestbookEntry[] = [];
    snap.forEach((d) => {
      results.push(d.data() as GuestbookEntry);
    });
    return results.sort((a,b) => b.createdAt.localeCompare(a.createdAt));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

export async function addGuestbookEntry(entry: GuestbookEntry): Promise<void> {
  const path = `guestbook/${entry.id}`;
  try {
    await setDoc(doc(db, 'guestbook', entry.id), entry);
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}
