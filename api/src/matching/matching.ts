export type Mandate = {
  countries: string[];
  categories: string[];
  licenses: string[];
  ticketMinEur: number;
  ticketMaxEur: number;
};

export type MatchableAsset = {
  country: string;
  category: string;
  licenseType: string;
  priceEur: number;
};

export type MatchResult = {
  score: number;
  reasons: string[];
};

export function parseJsonList(value: string | null | undefined): string[] {
  if (!value) {
    return [];
  }
  try {
    const parsed: unknown = JSON.parse(value);
    return Array.isArray(parsed)
      ? parsed.filter((item): item is string => typeof item === 'string')
      : [];
  } catch {
    return [];
  }
}

export function scoreAssetAgainstMandate(
  asset: MatchableAsset,
  mandate: Mandate,
): MatchResult {
  const reasons: string[] = [];
  let score = 0;

  const countries = mandate.countries.map((item) => item.toUpperCase());
  if (countries.includes(asset.country.toUpperCase())) {
    score += 40;
    reasons.push(`Jurisdiction ${asset.country}`);
  }

  const categories = mandate.categories.map((item) => item.toUpperCase());
  if (categories.includes(asset.category.toUpperCase())) {
    score += 25;
    reasons.push(`Category ${asset.category}`);
  }

  const licenses = mandate.licenses.map((item) => item.toLowerCase());
  if (licenses.includes(asset.licenseType.toLowerCase())) {
    score += 20;
    reasons.push(`License ${asset.licenseType}`);
  }

  if (
    asset.priceEur >= mandate.ticketMinEur &&
    asset.priceEur <= mandate.ticketMaxEur
  ) {
    score += 15;
    reasons.push('Ticket size fits mandate');
  }

  return { score, reasons };
}

export function scoreBuyerAgainstAsset(
  mandate: Mandate,
  asset: MatchableAsset,
): MatchResult {
  return scoreAssetAgainstMandate(asset, mandate);
}

export type ListingDraft = {
  country?: string;
  category?: string;
  licenseType?: string;
  regulator?: string;
  businessStatus?: string;
  priceEur?: number;
  employees?: number | null;
  included?: string[];
};

export type ListingAssessment = {
  errors: string[];
  warnings: string[];
};

export function assessListing(draft: ListingDraft): ListingAssessment {
  const errors: string[] = [];
  const warnings: string[] = [];
  const included = draft.included ?? [];

  if (!draft.country) {
    errors.push('Jurisdiction is required');
  }
  if (!draft.licenseType) {
    errors.push('License type is required');
  }
  if (draft.priceEur == null || Number.isNaN(draft.priceEur)) {
    errors.push('Asking price is required');
  } else if (draft.priceEur <= 0) {
    errors.push('Asking price must be greater than zero');
  } else if (draft.priceEur < 50_000) {
    warnings.push('Asking price is unusually low for a licensed financial asset');
  }

  if (!draft.regulator) {
    warnings.push('Regulator is empty — buyers typically expect FCA, C&ED, Bank of Lithuania, etc.');
  }

  if (draft.businessStatus === 'LICENSE_ONLY' && (draft.employees ?? 0) > 0) {
    warnings.push('License-only assets usually have no operating staff. Confirm business status.');
  }

  if (
    (draft.category === 'EMI' || draft.licenseType === 'EMI' || draft.licenseType === 'SEMI') &&
    !included.some((item) => /iban/i.test(item))
  ) {
    warnings.push('EMI / SEMI listings often include IBAN capability. Add it if it is part of the asset.');
  }

  return { errors, warnings };
}
