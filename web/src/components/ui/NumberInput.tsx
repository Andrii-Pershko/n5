'use client';

import { useState } from 'react';
import { classNames } from '@/lib/format';

export function NumberInput({
  name,
  value,
  onChange,
  min = 0,
  max,
  step = 50_000,
}: {
  name?: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
}) {
  const [focused, setFocused] = useState(false);

  function clamp(next: number) {
    let result = Number.isFinite(next) ? next : min;
    if (result < min) result = min;
    if (max != null && result > max) result = max;
    return result;
  }

  return (
    <div
      className={classNames(
        'mt-1 flex border bg-card transition',
        focused ? 'border-gold' : 'border-line hover:border-gold/50',
      )}
    >
      <input
        type="number"
        name={name}
        min={min}
        max={max}
        step={step}
        value={value}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        onChange={(event) => onChange(clamp(Number(event.target.value)))}
        className="w-full bg-transparent px-3 py-2 text-sm text-foreground outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
      />
      <div className="flex w-8 shrink-0 flex-col border-l border-inherit">
        <button
          type="button"
          aria-label="Increase"
          onClick={() => onChange(clamp(value + step))}
          className="grid flex-1 place-items-center text-gold hover:bg-gold/15"
        >
          <Caret up />
        </button>
        <button
          type="button"
          aria-label="Decrease"
          onClick={() => onChange(clamp(value - step))}
          className="grid flex-1 place-items-center border-t border-inherit text-gold hover:bg-gold/15"
        >
          <Caret />
        </button>
      </div>
    </div>
  );
}

function Caret({ up }: { up?: boolean }) {
  return (
    <svg
      viewBox="0 0 12 12"
      aria-hidden="true"
      className={classNames('h-3 w-3', up && 'rotate-180')}
    >
      <path fill="currentColor" d="M2.2 4.2a.7.7 0 0 1 1-.04L6 6.8l2.8-2.64a.7.7 0 0 1 .96 1.02L6.5 8.4a.7.7 0 0 1-.98 0L2.24 5.18a.7.7 0 0 1-.04-1Z" />
    </svg>
  );
}
