
export enum RelationshipType {
  FAMILY = 'familia',
  FRIEND = 'amigo',
  COLLEAGUE = 'colega',
  OTHER = 'outro'
}

export interface User {
  id: string;
  name: string;
  phone: string;
  email?: string;
  birthdate: string; // ISO format
  zodiacSign: string;
  zodiacTraits: string[];
  avatarUrl?: string;
  likes: string[];
  isProfilePrivate: boolean;
  mustChangePassword?: boolean;
}

export interface Relationship {
  id: string;
  userId: string;
  relatedUserId: string;
  type: RelationshipType;
  customLabel?: string;
}

export interface BirthdayEntry extends User {
  relationToViewer?: RelationshipType | null;
  customLabel?: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  token: string | null;
}
