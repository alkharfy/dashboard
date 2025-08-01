"use client";

import React, { useState, useMemo } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { MoreHorizontal, FileDown } from 'lucide-react';
import type { Task } from '@/lib/data';
import { useLanguage } from '@/contexts/language-context';
import type { UserRole } from '@/contexts/auth-context';
import { StarRating } from '@/components/shared/star-rating';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { format } from 'date-fns';

type TaskTableProps = {
  tasks: Task[];
  userRole: UserRole;
};

const statusVariants: { [key: string]: 'default' | 'secondary' | 'outline' | 'destructive' } = {
  completed: 'default',
  in_review: 'secondary',
  in_progress: 'outline',
  not_started: 'destructive',
};

export function TaskTable({ tasks, userRole }: TaskTableProps) {
  const { t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  
  const statusTranslations: { [key: string]: string } = {
    'not_started': t('not_started'),
    'in_progress': t('in_progress'),
    'in_review': t('in_review'),
    'completed': t('completed'),
  };

  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      const matchesSearch = task.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            task.services.join(', ').toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'All' || task.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [tasks, searchTerm, statusFilter]);

  const showAssignee = userRole === 'Admin' || userRole === 'Manager';

  return (
    <Card>
        <CardHeader>
            <div className="flex items-center gap-4">
                <Input
                placeholder={t('search')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
                />
                <Select onValueChange={setStatusFilter} defaultValue="All">
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder={t('filterByStatus')} />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="All">{t('allStatuses')}</SelectItem>
                        {Object.keys(statusVariants).map(status => (
                            <SelectItem key={status} value={status}>{statusTranslations[status as keyof typeof statusTranslations]}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <Button variant="outline" className="ms-auto">
                    <FileDown className="h-4 w-4 me-2" />
                    {t('export')}
                </Button>
            </div>
        </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('clientName')}</TableHead>
              <TableHead>{t('task')}</TableHead>
              {showAssignee && <TableHead>{t('designer')}</TableHead>}
              {showAssignee && <TableHead>{t('reviewer')}</TableHead>}
              <TableHead>{t('status')}</TableHead>
              <TableHead>{t('date')}</TableHead>
              <TableHead>{t('rating')}</TableHead>
              <TableHead>
                <span className="sr-only">{t('actions')}</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTasks.length > 0 ? filteredTasks.map((task) => (
              <TableRow key={task.id}>
                <TableCell className="font-medium">{task.clientName}</TableCell>
                <TableCell>{task.services.join(', ')}</TableCell>
                {showAssignee && <TableCell>{task.designerId || 'Unassigned'}</TableCell>}
                {showAssignee && <TableCell>{task.reviewerId || 'Unassigned'}</TableCell>}
                <TableCell>
                  <Badge variant={statusVariants[task.status]}>{statusTranslations[task.status as keyof typeof statusTranslations]}</Badge>
                </TableCell>
                <TableCell>{task.createdAt ? format(task.createdAt.toDate(), 'yyyy-MM-dd') : 'N/A'}</TableCell>
                <TableCell>
                  {task.designerRating ? <StarRating value={task.designerRating} readOnly /> : <span className="text-muted-foreground">{t('notRatedYet')}</span>}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button aria-haspopup="true" size="icon" variant="ghost">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">{t('actions')}</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>{t('actions')}</DropdownMenuLabel>
                      <DropdownMenuItem>{t('edit')}</DropdownMenuItem>
                      {userRole === 'Admin' && <DropdownMenuItem className="text-destructive">{t('delete')}</DropdownMenuItem>}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            )) : (
              <TableRow>
                <TableCell colSpan={showAssignee ? 8 : 6} className="h-24 text-center">
                  {t('noData')}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
