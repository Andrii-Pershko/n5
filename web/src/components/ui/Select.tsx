'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { classNames } from '@/lib/format';

export type SelectOption = {
  value: string;
  label: string;
};

export function Select({
  value,
  onChange,
  options,
  placeholder = 'Select',
  name,
  disabled,
}: {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  name?: string;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const listId = useId();
  const selected = options.find((option) => option.value === value);

  useEffect(() => {
    if (!open) {
      return;
    }
    const selectedIndex = options.findIndex((option) => option.value === value);
    setActiveIndex(selectedIndex >= 0 ? selectedIndex : 0);

    function onPointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open, options, value]);

  function choose(next: string) {
    onChange(next);
    setOpen(false);
  }

  function onTriggerKeyDown(event: React.KeyboardEvent<HTMLButtonElement>) {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      if (!open) {
        setOpen(true);
        return;
      }
      setActiveIndex((index) => Math.min(index + 1, options.length - 1));
    }
    if (event.key === 'ArrowUp') {
      event.preventDefault();
      if (!open) {
        setOpen(true);
        return;
      }
      setActiveIndex((index) => Math.max(index - 1, 0));
    }
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      if (!open) {
        setOpen(true);
        return;
      }
      const option = options[activeIndex];
      if (option) {
        choose(option.value);
      }
    }
  }

  return (
    <div ref={rootRef} className="relative mt-1">
      {name ? <input type="hidden" name={name} value={value} /> : null}
      <button
        type="button"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => setOpen((current) => !current)}
        onKeyDown={onTriggerKeyDown}
        className={classNames(
          'flex w-full items-center justify-between gap-3 border px-3 py-2 text-left text-sm transition',
          open ? 'border-gold bg-background' : 'border-line bg-background hover:border-gold/50',
          'focus-visible:border-gold focus-visible:outline-none',
          disabled && 'cursor-not-allowed opacity-50',
        )}
      >
        <span className={selected ? 'truncate text-foreground' : 'truncate text-muted'}>
          {selected?.label ?? placeholder}
        </span>
        <Chevron open={open} />
      </button>
      {open ? (
        <ul
          id={listId}
          role="listbox"
          tabIndex={-1}
          className="absolute z-40 mt-1 max-h-64 w-full overflow-auto border border-line bg-card py-1 shadow-[0_18px_40px_rgba(0,0,0,0.55)]"
        >
          {options.map((option, index) => {
            const isSelected = option.value === value;
            const isActive = index === activeIndex;
            return (
              <li key={option.value} role="none">
                <button
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onMouseEnter={() => setActiveIndex(index)}
                  onClick={() => choose(option.value)}
                  className={classNames(
                    'flex w-full items-center justify-between px-3 py-2 text-left text-sm',
                    isSelected && 'text-gold',
                    isActive && 'bg-gold/10',
                    !isSelected && !isActive && 'text-foreground',
                  )}
                >
                  <span>{option.label}</span>
                  {isSelected ? <span className="text-xs text-gold">●</span> : null}
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}

function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      viewBox="0 0 16 16"
      aria-hidden="true"
      className={classNames(
        'h-3.5 w-3.5 shrink-0 text-gold transition-transform',
        open && 'rotate-180',
      )}
    >
      <path
        fill="currentColor"
        d="M3.2 5.4a.8.8 0 0 1 1.1 0L8 9.1l3.7-3.7a.8.8 0 1 1 1.1 1.1l-4.2 4.3a.8.8 0 0 1-1.2 0L3.2 6.5a.8.8 0 0 1 0-1.1Z"
      />
    </svg>
  );
}
