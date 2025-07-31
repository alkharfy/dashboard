"use client";

import { useAuth, type UserRole } from "@/contexts/auth-context";
import { useLanguage } from "@/contexts/language-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Shield, PenTool, Eye } from 'lucide-react';

const roles: { role: UserRole; icon: React.ReactNode }[] = [
  { role: 'Admin', icon: <Shield className="h-5 w-5" /> },
  { role: 'Manager', icon: <Eye className="h-5 w-5" /> },
  { role: 'Designer', icon: <PenTool className="h-5 w-5" /> },
  { role: 'Reviewer', icon: <User className="h-5 w-5" /> },
];

export function LoginForm() {
  const { login } = useAuth();
  const { t } = useLanguage();

  const roleTranslations: Record<UserRole, string> = {
    'Admin': t('admin'),
    'Designer': t('designer'),
    'Reviewer': t('reviewer'),
    'Manager': t('manager'),
  };

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle className="text-2xl font-headline text-center">{t('loginAs')}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          {roles.map(({ role, icon }) => (
            <Button
              key={role}
              onClick={() => login(role)}
              className="w-full justify-start text-base py-6"
              variant="outline"
            >
              <div className="flex items-center gap-4">
                {icon}
                <span>{roleTranslations[role]}</span>
              </div>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
