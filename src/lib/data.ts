import { Timestamp } from 'firebase/firestore';

export type Task = {
    id: string;
    clientName: string;
    services: string[];
    assignee?: string; // Made optional as it might not be assigned initially
    status: 'Not Started' | 'In Progress' | 'In Review' | 'Completed';
    createdAt: Timestamp;
    rating?: number | null;
    // Fields from the form that are now in Firestore
    birthdate?: Timestamp | null;
    contactInfo: string;
    address?: string;
    jobTitle: string;
    education: string;
    experience: number;
    skills: string;
    designerNotes?: string;
    reviewerNotes?: string;
    paymentStatus: "Paid" | "Unpaid" | "Pending";
    attachments?: any[];
    assignedDesignerUid?: string | null;
    assignedReviewerUid?: string | null;
    designerRating?: number | null;
    designerFeedback?: string;
    reviewerRating?: number | null;
    reviewerFeedback?: string;
  };
  
  export type Account = {
      id: string;
      service: string;
      username: string;
      password_mock: string; // The real password would be handled securely
  };
  
  export const accounts: Account[] = [
      { id: 'acc-1', service: 'Kickresume', username: 'team@cv-assist.com', password_mock: 'kick123!'},
      { id: 'acc-2', service: 'Canva Pro', username: 'design@cv-assist.com', password_mock: 'canvaPro!Secure'},
      { id: 'acc-3', service: 'Grammarly Business', username: 'edit@cv-assist.com', password_mock: 'grammarlyPass'},
  ];
  
  // User data is mocked in auth-context.tsx
  