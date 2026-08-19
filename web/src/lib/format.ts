export function formatPrice(eur: number) {
  if (eur >= 1_000_000) {
    const value = eur / 1_000_000;
    return `€${Number.isInteger(value) ? value.toFixed(1) : value.toFixed(1)}M`;
  }
  if (eur >= 1_000) {
    return `€${(eur / 1_000).toFixed(1)}K`;
  }
  return `€${eur}`;
}

export function formatTicket(min: number, max: number) {
  return `${formatPrice(min)} – ${formatPrice(max)}`;
}

export function classNames(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(' ');
}
