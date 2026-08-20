'use client';

import { useRouter } from 'next/navigation';
import { useEffect, type ReactNode } from 'react';
import { useAppSelector } from '@/store/hooks';
import { useT } from '@/i18n/useT';
import type { Role } from '@/lib/types';

export function RoleGate({
  roles,
  children,
}: {
  roles: Role[];
  children: ReactNode;
}) {
  const router = useRouter();
  const user = useAppSelector((state) => state.auth.user);
  const t = useT();

  useEffect(() => {
    if (!user) {
      router.replace('/signin');
    }
  }, [user, router]);

  if (!user) {
    return (
      <div className="px-4 py-16 text-center text-muted">{t('gate.checking')}</div>
    );
  }
  if (!roles.includes(user.role)) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <h1 className="text-2xl text-foreground">{t('gate.closed')}</h1>
        <p className="mt-3 text-muted">{t('gate.closedHint', { role: user.role })}</p>
      </div>
    );
  }
  return <>{children}</>;
}
