"use client";

import { useAuth } from '@/contexts/auth-context';
import { useLanguage } from '@/contexts/language-context';
import { StatCard } from '@/components/dashboard/stat-card';
import { RecentActivity } from '@/components/dashboard/recent-activity';
import {
  ClipboardCheck,
  ClipboardList,
  Clock,
  Users,
  Star,
} from 'lucide-react';

export default function DashboardPage() {
  const { user } = useAuth();
  const { t } = useLanguage();

  if (!user) return null;

  const roleTranslations = {
    'Admin': t('admin'),
    'Designer': t('designer'),
    'Reviewer': t('reviewer'),
    'Manager': t('manager'),
  };

  const commonStats = [
    {
      title: t('totalTasks'),
      value: '120',
      icon: <ClipboardList className="h-6 w-6 text-muted-foreground" />,
    },
    {
      title: t('completedTasks'),
      value: '90',
      icon: <ClipboardCheck className="h-6 w-6 text-muted-foreground" />,
    },
    {
      title: t('pendingTasks'),
      value: '30',
      icon: <Clock className="h-6 w-6 text-muted-foreground" />,
    },
  ];
  
  const adminManagerStats = [
      ...commonStats,
    {
      title: t('totalClients'),
      value: '50',
      icon: <Users className="h-6 w-6 text-muted-foreground" />,
    },
  ];

  const designerReviewerStats = [
      ...commonStats,
    {
      title: t('avgRating'),
      value: '4.5 ★',
      icon: <Star className="h-6 w-6 text-muted-foreground" />,
    },
  ];

  const stats =
    user.role === 'Admin' || user.role === 'Manager'
      ? adminManagerStats
      : designerReviewerStats;

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-headline font-bold">
          {t('welcomeBack')}, {user.name}!
        </h1>
        <p className="text-muted-foreground">{t('dashboardOverview')}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <StatCard
            key={index}
            title={stat.title}
            value={stat.value}
            icon={stat.icon}
          />
        ))}
      </div>

      <div>
        <RecentActivity />
      </div>
    </div>
  );
}
