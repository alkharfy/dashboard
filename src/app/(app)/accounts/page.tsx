"use client";

import { useAuth } from '@/contexts/auth-context';
import { useLanguage } from '@/contexts/language-context';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, Eye, EyeOff } from 'lucide-react';
import { accounts, Account } from '@/lib/data';
import { useState } from 'react';

export default function AccountsPage() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [visiblePasswords, setVisiblePasswords] = useState<Record<string, boolean>>({});

  if (user?.role !== 'Admin') {
    return (
      <div className="flex items-center justify-center h-full">
        <p>You are not authorized to view this page.</p>
      </div>
    );
  }

  const togglePasswordVisibility = (id: string) => {
    setVisiblePasswords(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
            <div>
                <CardTitle className="font-headline">{t('externalAccounts')}</CardTitle>
                <CardDescription>Manage credentials for external services.</CardDescription>
            </div>
            <Button>
                <PlusCircle className="h-4 w-4 me-2" />
                {t('addAccount')}
            </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('service')}</TableHead>
              <TableHead>{t('usernameEmail')}</TableHead>
              <TableHead>{t('password')}</TableHead>
              <TableHead><span className="sr-only">{t('actions')}</span></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {accounts.map((account) => (
              <TableRow key={account.id}>
                <TableCell className="font-medium">{account.service}</TableCell>
                <TableCell>{account.username}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <span className="font-mono">
                      {visiblePasswords[account.id] ? account.password_mock : '••••••••'}
                    </span>
                    <Button variant="ghost" size="icon" onClick={() => togglePasswordVisibility(account.id)}>
                      {visiblePasswords[account.id] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      <span className="sr-only">{visiblePasswords[account.id] ? t('hide') : t('show')}</span>
                    </Button>
                  </div>
                </TableCell>
                <TableCell>
                    <Button variant="outline" size="sm">{t('edit')}</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
