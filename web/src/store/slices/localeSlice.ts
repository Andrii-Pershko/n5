import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { Locale } from '@/i18n/messages';

type LocaleState = {
  locale: Locale;
};

const initialState: LocaleState = {
  locale: 'en',
};

const localeSlice = createSlice({
  name: 'locale',
  initialState,
  reducers: {
    setLocale(state, action: PayloadAction<Locale>) {
      state.locale = action.payload;
    },
  },
});

export const { setLocale } = localeSlice.actions;
export const localeReducer = localeSlice.reducer;
