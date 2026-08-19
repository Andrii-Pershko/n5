import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { BusinessCategory } from '@/lib/types';

export type BuyerDeskFilters = {
  q: string;
  category: BusinessCategory | '';
  country: string;
  license: string;
  ticketMinEur: number | '';
  ticketMaxEur: number | '';
};

const initialState: BuyerDeskFilters = {
  q: '',
  category: '',
  country: '',
  license: '',
  ticketMinEur: '',
  ticketMaxEur: '',
};

const buyerFiltersSlice = createSlice({
  name: 'buyerFilters',
  initialState,
  reducers: {
    setBuyerFilters(state, action: PayloadAction<Partial<BuyerDeskFilters>>) {
      Object.assign(state, action.payload);
    },
    resetBuyerFilters() {
      return initialState;
    },
  },
});

export const { setBuyerFilters, resetBuyerFilters } = buyerFiltersSlice.actions;
export const buyerFiltersReducer = buyerFiltersSlice.reducer;
