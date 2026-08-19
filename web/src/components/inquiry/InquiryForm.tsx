'use client';

import { useState } from 'react';
import { api } from '@/lib/api';
import { useT } from '@/i18n/useT';
import { useAppSelector } from '@/store/hooks';

export function InquiryForm({
  assetId,
  buyerId,
  placeholder,
}: {
  assetId?: string;
  buyerId?: string;
  placeholder: string;
}) {
  const token = useAppSelector((state) => state.auth.token);
  const t = useT();
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');
  const [error, setError] = useState('');

  async function submit() {
    setStatus('loading');
    setError('');
    try {
      await api('/inquiries', {
        method: 'POST',
        token,
        body: { assetId, buyerId, message },
      });
      setStatus('done');
      setMessage('');
    } catch (err) {
      setStatus('error');
      setError(err instanceof Error ? err.message : t('inquiry.error'));
    }
  }

  if (status === 'done') {
    return (
      <div className="border border-gold/40 bg-gold/10 p-4 text-sm text-gold">
        {t('inquiry.sent')}
      </div>
    );
  }

  return (
    <div className="border border-line bg-card p-4">
      <h3 className="text-sm uppercase tracking-[0.16em] text-muted">{t('inquiry.title')}</h3>
      <textarea
        value={message}
        onChange={(event) => setMessage(event.target.value)}
        rows={4}
        placeholder={placeholder}
        className="mt-3 w-full border border-line bg-background px-3 py-2 text-sm text-foreground"
      />
      {error && <p className="mt-2 text-sm text-red-400">{error}</p>}
      <button
        disabled={message.trim().length < 10 || status === 'loading'}
        onClick={() => void submit()}
        className="mt-3 rounded-full bg-gold px-4 py-2 text-sm font-medium text-background hover:bg-gold-2 disabled:opacity-40"
      >
        {status === 'loading' ? t('inquiry.sending') : t('inquiry.send')}
      </button>
    </div>
  );
}
