export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  photoURL?: string;
  createdAt: string;
}

export type VisibilityType = 'public' | 'semi-private' | 'private';

export interface BirthdayPage {
  id: string;
  creatorUid: string;
  creatorEmail: string;
  creatorName: string;
  recipientName: string;
  birthdayDate: string; // YYYY-MM-DD
  unlockDateTimeUTC: string; // ISO String
  accessCode: string;
  visibility: VisibilityType;
  theme: string; // e.g. "classic", "gold-luxury", "pastel-cute", "neon-galaxy", "sunset-romantic", "minimalist"
  title: string;
  message: string;
  createdAt: string;
  openedCount: number;
  lastOpened?: string;
  isAnonymous?: boolean;
}

export interface FriendContribution {
  id: string;
  pageId: string;
  author: string;
  content: string;
  createdAt: string;
}

export interface GuestbookEntry {
  id: string;
  pageId: string;
  author: string;
  message: string;
  createdAt: string;
}
