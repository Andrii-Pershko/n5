'use client';

import { useCallback } from 'react';
import { useAppSelector } from '@/store/hooks';
import { translate } from './translate';

export function useT() {
  const locale = useAppSelector((state) => state.locale.locale);
  return useCallback(
    (path: string, vars?: Record<string, string | number>) =>
      translate(locale, path, vars),
    [locale],
  );
}

export function useLocale() {
  return useAppSelector((state) => state.locale.locale);
}
