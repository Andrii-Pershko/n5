'use client';

import { classNames } from '@/lib/format';
import { useT } from '@/i18n/useT';

export const PAGE_SIZE = 10;

export function Pagination({
  page,
  pageCount,
  total,
  onPage,
}: {
  page: number;
  pageCount: number;
  total: number;
  onPage: (page: number) => void;
}) {
  const t = useT();
  if (total <= PAGE_SIZE) {
    return null;
  }

  const pages = Array.from({ length: pageCount }, (_, index) => index + 1);

  return (
    <nav className="flex flex-wrap items-center justify-between gap-3 pt-2 text-sm">
      <p className="text-muted">
        {t('pagination.summary', { total, page, pageCount })}
      </p>
      <div className="flex items-center gap-1">
        <button
          type="button"
          disabled={page <= 1}
          onClick={() => onPage(page - 1)}
          className="rounded-full border border-line bg-card px-3 py-1.5 text-muted hover:border-gold/50 hover:text-gold disabled:opacity-40"
        >
          {t('pagination.prev')}
        </button>
        {pages.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => onPage(item)}
            className={classNames(
              'min-w-9 rounded-full border px-3 py-1.5',
              item === page
                ? 'border-gold bg-gold/10 text-gold'
                : 'border-line bg-card text-muted hover:border-gold/50 hover:text-gold',
            )}
          >
            {item}
          </button>
        ))}
        <button
          type="button"
          disabled={page >= pageCount}
          onClick={() => onPage(page + 1)}
          className="rounded-full border border-line bg-card px-3 py-1.5 text-muted hover:border-gold/50 hover:text-gold disabled:opacity-40"
        >
          {t('pagination.next')}
        </button>
      </div>
    </nav>
  );
}
