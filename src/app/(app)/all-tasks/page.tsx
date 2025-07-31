"use client";

import { useAuth } from '@/contexts/auth-context';
import { useLanguage } from '@/contexts/language-context';
import { TaskTable } from '@/components/tasks/task-table';
import { Task } from '@/lib/data';
import { useEffect, useState } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default function AllTasksPage() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.role === 'Admin' || user?.role === 'Manager') {
      const unsubscribe = onSnapshot(collection(db, "tasks"), (snapshot) => {
        const tasksData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Task));
        setTasks(tasksData);
        setLoading(false);
      });
      return () => unsubscribe();
    } else {
        setLoading(false);
    }
  }, [user]);

  if (loading) {
    return <div className="flex items-center justify-center h-full"><p>Loading...</p></div>;
  }

  if (user?.role !== 'Admin' && user?.role !== 'Manager') {
    return (
      <div className="flex items-center justify-center h-full">
        <p>You are not authorized to view this page.</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-headline font-bold mb-4">{t('allTasks')}</h1>
      <TaskTable tasks={tasks} userRole={user.role} />
    </div>
  );
}
