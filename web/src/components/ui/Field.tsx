import type { InputHTMLAttributes } from 'react';

export function Field({
  name,
  label,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { name: string; label: string }) {
  return (
    <label className="block text-xs uppercase tracking-wider text-muted">
      {label}
      <input
        name={name}
        {...props}
        className="mt-1 w-full border border-line bg-background px-3 py-2 text-sm text-foreground outline-none transition hover:border-gold/50 focus:border-gold"
      />
    </label>
  );
}
