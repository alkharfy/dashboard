export type Task = {
    id: string;
    clientName: string;
    services: string[];
    assignee: string;
    status: 'Not Started' | 'In Progress' | 'In Review' | 'Completed';
    date: string;
    rating: number | null;
  };
  
  export const tasks: Task[] = [
    { id: '1', clientName: 'Ahmad Al-Farsi', services: ['CV Writing'], assignee: 'Designer User', status: 'Completed', date: '2023-10-26', rating: 5 },
    { id: '2', clientName: 'Fatima Al-Marzouqi', services: ['Cover Letter', 'LinkedIn Profile'], assignee: 'Designer User', status: 'In Review', date: '2023-10-25', rating: null },
    { id: '3', clientName: 'Yusuf Al-Hashemi', services: ['CV Writing'], assignee: 'Another Designer', status: 'In Progress', date: '2023-10-24', rating: null },
    { id: '4', clientName: 'Layla Al-Nuaimi', services: ['LinkedIn Profile'], assignee: 'Designer User', status: 'Not Started', date: '2023-10-27', rating: null },
    { id: '5', clientName: 'Omar Al-Mansoori', services: ['CV Writing', 'Cover Letter'], assignee: 'Another Designer', status: 'Completed', date: '2023-10-22', rating: 4 },
  ];
  
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
  