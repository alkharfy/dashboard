"use client";

import { useAuth } from '@/contexts/auth-context';
import { useLanguage } from '@/contexts/language-context';
import { TaskTable } from '@/components/tasks/task-table';
import { Task } from '@/lib/data';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default function MyTasksPage() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [myTasks, setMyTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    let q;
    if (user.role === 'Designer') {
      q = query(collection(db, "tasks"), where("assignedDesignerUid", "==", user.uid));
    } else if (user.role === 'Reviewer') {
      q = query(collection(db, "tasks"), where("status", "==", "In Review"));
    } else {
        setLoading(false);
        return;
    }

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const tasksData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Task));
      setMyTasks(tasksData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  if (loading) {
    return (
       <div className="flex items-center justify-center h-full">
        <p>Loading tasks...</p>
      </div>
    );
  }

  if (!user || (user.role !== 'Designer' && user.role !== 'Reviewer')) {
    return (
       <div className="flex items-center justify-center h-full">
        <p>This page is for Designers and Reviewers.</p>
      </div>
    );
  }
  
  return (
    <div>
      <h1 className="text-3xl font-headline font-bold mb-4">{t('myTasks')}</h1>
       {myTasks.length > 0 ? (
        <TaskTable tasks={myTasks} userRole={user.role} />
      ) : (
        <Card className="mt-8">
            <CardHeader>
                <CardTitle className="font-headline">{t('noTasksAssigned')}</CardTitle>
            </CardHeader>
            <CardContent>
                <p>You have no tasks assigned to you at the moment. Great job!</p>
            </CardContent>
        </Card>
      )}
    </div>
  );
}
