'use client';

import Link from 'next/link';
import { useT } from '@/i18n/useT';
import { useAppSelector } from '@/store/hooks';

export default function HomePage() {
  const t = useT();
  const user = useAppSelector((state) => state.auth.user);

  return (
    <section className="max-w-2xl">
      <p className="text-xs uppercase tracking-[0.22em] text-gold">{t('home.kicker')}</p>
      <h1 className="mt-4 text-4xl leading-tight text-foreground sm:text-5xl">
        {t('home.title')}
      </h1>
      <p className="mt-5 text-muted">{t('home.lead')}</p>
      {user && (
        <p className="mt-4 text-sm text-gold">
          {t('home.sessionRestored', { name: user.name })}
        </p>
      )}
      <div className="mt-8 flex flex-wrap gap-3">
        {user ? (
          <Link
            href="/listings"
            className="rounded-full bg-gold px-5 py-2 text-sm text-background hover:bg-gold-2"
          >
            {t('home.continueSession')}
          </Link>
        ) : (
          <>
            <Link
              href="/signin"
              className="rounded-full bg-gold px-5 py-2 text-sm text-background hover:bg-gold-2"
            >
              {t('home.signInTitle')}
            </Link>
            <Link
              href="/register"
              className="rounded-full border border-line px-5 py-2 text-sm text-muted hover:border-gold/50 hover:text-gold"
            >
              {t('home.createAccount')}
            </Link>
          </>
        )}
        <Link
          href="/listings"
          className="rounded-full border border-line px-5 py-2 text-sm text-muted hover:border-gold/50 hover:text-gold"
        >
          {t('home.browseCatalog')}
        </Link>
      </div>
    </section>
  );
}
