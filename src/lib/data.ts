import { Timestamp } from 'firebase/firestore';

export type UserRole = 'Admin' | 'Designer' | 'Reviewer' | 'Manager';

export type UserProfile = {
  uid: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
  status: 'available' | 'busy' | 'on_leave';
  workplace?: string;
  createdAt: Timestamp;
};

export type TaskAttachment = {
  name: string;
  url: string;
  mime: string;
  size: number;
};

export type Task = {
  id: string; // Document ID
  clientName: string;
  birthdate?: Timestamp | null;
  contactInfo: {
    phone?: string;
    email?: string;
  };
  address?: string;
  jobTitle: string;
  education: string;
  experienceYears: number;
  skills: string[];
  services: string[];
  designerNotes?: string;
  reviewerNotes?: string;
  paymentMethod: 'instapay' | 'paysky' | 'other';
  paymentStatus: 'paid' | 'unpaid' | 'pending';
  attachments: TaskAttachment[];
  status: 'not_started' | 'in_progress' | 'in_review' | 'completed';
  designerId?: string | null; // UID of the assigned designer
  reviewerId?: string | null; // UID of the assigned reviewer
  designerRating?: number | null;
  designerFeedback?: string;
  reviewerRating?: number | null;
  reviewerFeedback?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
};

export type Account = {
  id: string;
  serviceName: string;
  username: string;
  // Password will be handled securely in the backend
  notes?: string;
  createdAt: Timestamp;
};
