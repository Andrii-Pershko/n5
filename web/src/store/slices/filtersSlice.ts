import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { BusinessCategory, BusinessStatus } from '@/lib/types';

export type CatalogFilters = {
  q: string;
  category: BusinessCategory | '';
  country: string;
  businessStatus: BusinessStatus | '';
  sort: 'newest' | 'price_asc' | 'price_desc' | 'match';
};

const initialState: CatalogFilters = {
  q: '',
  category: '',
  country: '',
  businessStatus: '',
  sort: 'newest',
};

const filtersSlice = createSlice({
  name: 'filters',
  initialState,
  reducers: {
    setFilters(state, action: PayloadAction<Partial<CatalogFilters>>) {
      Object.assign(state, action.payload);
    },
    resetFilters() {
      return initialState;
    },
  },
});

export const { setFilters, resetFilters } = filtersSlice.actions;
export const filtersReducer = filtersSlice.reducer;
