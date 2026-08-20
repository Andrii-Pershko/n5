'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LOCALES } from '@/i18n/messages';
import { useT } from '@/i18n/useT';
import { classNames } from '@/lib/format';
import type { Role } from '@/lib/types';
import { logout } from '@/store/slices/authSlice';
import { setLocale } from '@/store/slices/localeSlice';
import { useAppDispatch, useAppSelector } from '@/store/hooks';

const LINKS: { href: string; labelKey: string; roles?: Role[] }[] = [
  { href: '/listings', labelKey: 'nav.listings' },
  { href: '/buyers', labelKey: 'nav.buyers', roles: ['SELLER', 'MANAGER'] },
  { href: '/sell', labelKey: 'nav.publish', roles: ['SELLER'] },
  { href: '/profile', labelKey: 'nav.mandate', roles: ['BUYER'] },
  { href: '/inbox', labelKey: 'nav.inbox', roles: ['BUYER', 'SELLER', 'MANAGER'] },
  { href: '/admin', labelKey: 'nav.manager', roles: ['MANAGER'] },
];

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const t = useT();
  const user = useAppSelector((state) => state.auth.user);
  const locale = useAppSelector((state) => state.locale.locale);

  return (
    <header className="sticky top-0 z-30 border-b border-line/80 bg-background/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link href={user ? '/listings' : '/'} className="flex items-center gap-2 hover:opacity-80">
          <span className="grid h-8 w-8 place-items-center rounded-sm bg-gold text-xs font-bold text-background">
            N5
          </span>
          <span className="text-sm font-semibold tracking-[0.18em] uppercase text-foreground">
            Deal
          </span>
        </Link>
        <nav className="hidden items-center gap-1 md:flex">
          {LINKS.filter((link) => !link.roles || (user && link.roles.includes(user.role))).map(
            (link) => (
              <Link
                key={link.href}
                href={link.href}
                className={classNames(
                  'rounded-full px-3 py-1.5 text-sm transition',
                  pathname.startsWith(link.href)
                    ? 'bg-card text-gold'
                    : 'text-muted hover:bg-card/80 hover:text-gold',
                )}
              >
                {t(link.labelKey)}
              </Link>
            ),
          )}
        </nav>
        <div className="flex items-center gap-3 text-sm">
          <div className="flex overflow-hidden rounded-full border border-line text-xs">
            {LOCALES.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => dispatch(setLocale(item))}
                className={classNames(
                  'px-2 py-1 uppercase first:rounded-l-full last:rounded-r-full',
                  locale === item ? 'bg-gold/15 text-gold' : 'text-muted hover:text-gold',
                )}
              >
                {item}
              </button>
            ))}
          </div>
          {user ? (
            <>
              <div className="hidden text-right sm:block">
                <div className="text-foreground">{user.name}</div>
                <div className="text-xs uppercase tracking-wider text-muted">
                  {t(`roles.${user.role}`)}
                </div>
              </div>
              <button
                className="rounded-full border border-line px-3 py-1.5 text-muted hover:border-gold/50 hover:text-gold"
                onClick={() => {
                  dispatch(logout());
                  router.push('/');
                }}
              >
                {t('nav.signOut')}
              </button>
            </>
          ) : (
            <>
              <Link href="/register" className="text-muted hover:text-gold">
                {t('nav.createAccount')}
              </Link>
              <Link href="/signin" className="text-gold hover:text-gold-2">
                {t('nav.signIn')}
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
