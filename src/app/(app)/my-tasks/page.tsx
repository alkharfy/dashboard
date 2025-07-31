"use client";

import { useAuth } from '@/contexts/auth-context';
import { useLanguage } from '@/contexts/language-context';
import { TaskTable } from '@/components/tasks/task-table';
import { tasks } from '@/lib/data';
import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function MyTasksPage() {
  const { user } = useAuth();
  const { t } = useLanguage();

  const myTasks = useMemo(() => {
    if (!user) return [];
    if (user.role === 'Designer') {
      return tasks.filter((task) => task.assignee === user.name);
    }
    if (user.role === 'Reviewer') {
      return tasks.filter((task) => task.status === 'In Review');
    }
    return [];
  }, [user]);

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
