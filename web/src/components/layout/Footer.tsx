'use client';

import { useT } from '@/i18n/useT';

export function Footer() {
  const t = useT();

  return (
    <footer className="border-t border-line/80 bg-card/70">
      <div className="mx-auto max-w-6xl px-4 py-5 text-center text-xs leading-5 text-muted">
        <p>{t('common.copyright')}</p>
        <p className="mt-1">© {new Date().getFullYear()} PershkoAndrii · n5Bank take-home · N5Deal prototype</p>
      </div>
    </footer>
  );
}
