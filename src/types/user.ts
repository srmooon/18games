export interface User {
  id: string;
  email: string;
  username: string;
  displayName?: string;
  photoURL?: string;
  createdAt: Date;
  updatedAt: Date;
  emailVerified?: boolean;
}
