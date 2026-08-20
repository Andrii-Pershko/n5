'use client';

import { classNames } from '@/lib/format';

export function Checkbox({
  checked,
  onChange,
  name,
  value,
  children,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  name?: string;
  value?: string;
  children: React.ReactNode;
}) {
  return (
    <label
      className={classNames(
        'group inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs tracking-wider uppercase transition',
        checked
          ? 'border-gold bg-gold/10 text-gold'
          : 'border-line text-muted hover:border-gold/45 hover:bg-gold/5 hover:text-foreground',
        'has-[:focus-visible]:border-gold',
      )}
    >
      <input
        type="checkbox"
        name={name}
        value={value}
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="sr-only"
      />
      <span
        className={classNames(
          'grid h-3.5 w-3.5 shrink-0 place-items-center border transition',
          checked
            ? 'border-gold bg-gold text-white'
            : 'border-line bg-background group-hover:border-gold/60',
        )}
      >
        {checked ? (
          <svg viewBox="0 0 12 12" aria-hidden="true" className="h-2.5 w-2.5">
            <path
              fill="currentColor"
              d="M10.2 2.6a.75.75 0 0 1 .1 1.06L5.3 9.3a.75.75 0 0 1-1.12.04L1.6 6.7a.75.75 0 0 1 1.08-1.04l2.02 2.1 4.36-4.96a.75.75 0 0 1 1.06-.1Z"
            />
          </svg>
        ) : null}
      </span>
      {children}
    </label>
  );
}
