'use client';

import Link from 'next/link';
import { useT } from '@/i18n/useT';

export default function NotFoundPage() {
  const t = useT();

  return (
    <section className="mx-auto flex w-full max-w-lg flex-col items-center py-10 text-center sm:py-16">
      <p className="text-xs uppercase tracking-[0.22em] text-gold">{t('notFound.kicker')}</p>
      <p className="mt-4 text-7xl font-semibold tracking-tight text-gold sm:text-8xl">
        {t('notFound.code')}
      </p>
      <h1 className="mt-5 text-3xl leading-tight text-foreground sm:text-4xl">
        {t('notFound.title')}
      </h1>
      <p className="mt-4 max-w-md text-sm text-muted sm:text-base">{t('notFound.lead')}</p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/"
          className="rounded-full bg-gold px-5 py-2 text-sm text-white hover:bg-gold-2"
        >
          {t('notFound.home')}
        </Link>
        <Link
          href="/listings"
          className="rounded-full border border-gold/30 bg-card px-5 py-2 text-sm text-gold hover:bg-gold/5"
        >
          {t('notFound.listings')}
        </Link>
      </div>
    </section>
  );
}
