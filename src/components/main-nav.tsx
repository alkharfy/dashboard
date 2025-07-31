"use client";

import Link from 'next/link';
import {
  LayoutDashboard,
  ClipboardList,
  ClipboardCheck,
  PlusSquare,
  Users,
  User,
  LogOut,
  FolderKanban,
} from 'lucide-react';
import { useAuth, UserRole } from '@/contexts/auth-context';
import { useLanguage } from '@/contexts/language-context';
import { usePathname } from 'next/navigation';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

type NavLink = {
  href: string;
  labelKey: any; // TranslationKey but any to avoid circular deps
  icon: React.ElementType;
  roles: UserRole[];
};

const navLinks: NavLink[] = [
  { href: '/dashboard', labelKey: 'dashboard', icon: LayoutDashboard, roles: ['Admin', 'Designer', 'Reviewer', 'Manager'] },
  { href: '/my-tasks', labelKey: 'myTasks', icon: ClipboardList, roles: ['Designer', 'Reviewer'] },
  { href: '/all-tasks', labelKey: 'allTasks', icon: FolderKanban, roles: ['Admin', 'Manager'] },
  { href: '/tasks/new', labelKey: 'newTask', icon: PlusSquare, roles: ['Admin', 'Designer'] },
  { href: '/accounts', labelKey: 'accounts', icon: Users, roles: ['Admin'] },
];

const bottomLinks: NavLink[] = [
  { href: '/profile', labelKey: 'profile', icon: User, roles: ['Admin', 'Designer', 'Reviewer', 'Manager'] },
];

export function MainNav() {
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const pathname = usePathname();

  if (!user) return null;

  const renderLink = (link: NavLink, isBottom: boolean = false) => {
    if (!link.roles.includes(user.role)) {
      return null;
    }
    const isActive = pathname === link.href;
    return (
      <Tooltip key={link.href}>
        <TooltipTrigger asChild>
          <Link
            href={link.href}
            className={cn(
              'flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8',
              isActive && 'bg-accent text-accent-foreground'
            )}
          >
            <link.icon className="h-5 w-5" />
            <span className="sr-only">{t(link.labelKey)}</span>
          </Link>
        </TooltipTrigger>
        <TooltipContent side="right">{t(link.labelKey)}</TooltipContent>
      </Tooltip>
    );
  };

  return (
    <TooltipProvider>
      <aside className="fixed inset-y-0 left-0 z-10 hidden w-14 flex-col border-r bg-background sm:flex">
        <nav className="flex flex-col items-center gap-4 px-2 sm:py-5">
          <Link
            href="/dashboard"
            className="group flex h-9 w-9 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:h-8 md:w-8 md:text-base"
          >
            <ClipboardCheck className="h-4 w-4 transition-all group-hover:scale-110" />
            <span className="sr-only">{t('appName')}</span>
          </Link>
          {navLinks.map(link => renderLink(link))}
        </nav>
        <nav className="mt-auto flex flex-col items-center gap-4 px-2 sm:py-5">
          {bottomLinks.map(link => renderLink(link))}
           <Tooltip>
            <TooltipTrigger asChild>
                <button
                onClick={logout}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8"
                >
                <LogOut className="h-5 w-5" />
                <span className="sr-only">{t('logout')}</span>
                </button>
            </TooltipTrigger>
            <TooltipContent side="right">{t('logout')}</TooltipContent>
            </Tooltip>
        </nav>
      </aside>
    </TooltipProvider>
  );
}
