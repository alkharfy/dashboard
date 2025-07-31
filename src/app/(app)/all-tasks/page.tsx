"use client";

import { useAuth } from '@/contexts/auth-context';
import { useLanguage } from '@/contexts/language-context';
import { TaskTable } from '@/components/tasks/task-table';
import { tasks } from '@/lib/data';

export default function AllTasksPage() {
  const { user } = useAuth();
  const { t } = useLanguage();

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
