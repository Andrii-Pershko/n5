export type BuyerFilterQuery = {
  q?: string;
  country?: string;
  category?: string;
  license?: string;
  ticketMinEur?: number;
  ticketMaxEur?: number;
};

export type FilterableBuyer = {
  countries: string[];
  categories: string[];
  licenses: string[];
  ticketMinEur: number;
  ticketMaxEur: number;
  thesis: string;
  user: { name: string; company: string | null };
};

export function matchesBuyerFilters(
  item: FilterableBuyer,
  query: BuyerFilterQuery,
): boolean {
  if (query.country && !item.countries.includes(query.country.toUpperCase())) {
    return false;
  }
  if (
    query.category &&
    !item.categories.includes(query.category.toUpperCase())
  ) {
    return false;
  }
  if (query.license) {
    const license = query.license.toLowerCase();
    if (!item.licenses.some((entry) => entry.toLowerCase() === license)) {
      return false;
    }
  }
  if (query.ticketMinEur != null && item.ticketMaxEur < query.ticketMinEur) {
    return false;
  }
  if (query.ticketMaxEur != null && item.ticketMinEur > query.ticketMaxEur) {
    return false;
  }
  if (query.q) {
    const q = query.q.toLowerCase();
    const hay = `${item.user.name} ${item.user.company ?? ''} ${item.thesis}`.toLowerCase();
    if (!hay.includes(q)) {
      return false;
    }
  }
  return true;
}
