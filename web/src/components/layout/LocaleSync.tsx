'use client';

import { useEffect } from 'react';
import { useAppSelector } from '@/store/hooks';

export function LocaleSync() {
  const locale = useAppSelector((state) => state.locale.locale);

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  return null;
}
