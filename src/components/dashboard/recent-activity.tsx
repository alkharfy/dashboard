import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/components/ui/avatar';
import { useLanguage } from '@/contexts/language-context';

const activities = [
    { name: 'John Doe', action: 'completed a task:', task: 'CV for Tech Corp', time: '1 hour ago' },
    { name: 'Jane Smith', action: 'added a new task:', task: 'LinkedIn Profile for Marketing Lead', time: '3 hours ago' },
    { name: 'Admin', action: 'assigned a task to you.', task: 'Cover letter for Jane Doe', time: '1 day ago' },
    { name: 'Peter Jones', action: 'reviewed a task:', task: 'CV for a Junior Developer', time: '2 days ago' },
];

export function RecentActivity() {
  const { t } = useLanguage();
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">{t('recentActivity')}</CardTitle>
        <CardDescription>
          See what's new in your team.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-8">
            {activities.map((activity, index) => (
                 <div key={index} className="flex items-center">
                    <Avatar className="h-9 w-9">
                    <AvatarImage src={`https://i.pravatar.cc/150?u=${activity.name}`} alt="Avatar" />
                    <AvatarFallback>{activity.name.substring(0,2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="ms-4 space-y-1">
                    <p className="text-sm font-medium leading-none">
                        {activity.name} <span className="text-muted-foreground">{activity.action}</span> {activity.task}
                    </p>
                    <p className="text-sm text-muted-foreground">{activity.time}</p>
                    </div>
                </div>
            ))}
        </div>
      </CardContent>
    </Card>
  );
}
