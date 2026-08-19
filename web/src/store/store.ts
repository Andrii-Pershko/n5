import { combineReducers, configureStore } from '@reduxjs/toolkit';
import {
  FLUSH,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
  REHYDRATE,
  persistReducer,
  persistStore,
} from 'redux-persist';
import createWebStorage from 'redux-persist/lib/storage/createWebStorage';
import { authReducer } from './slices/authSlice';
import { buyerFiltersReducer } from './slices/buyerFiltersSlice';
import { filtersReducer } from './slices/filtersSlice';
import { localeReducer } from './slices/localeSlice';

function createNoopStorage() {
  return {
    getItem() {
      return Promise.resolve(null);
    },
    setItem(_key: string, value: string) {
      return Promise.resolve(value);
    },
    removeItem() {
      return Promise.resolve();
    },
  };
}

const storage =
  typeof window === 'undefined' ? createNoopStorage() : createWebStorage('local');

const rootReducer = combineReducers({
  auth: authReducer,
  filters: filtersReducer,
  buyerFilters: buyerFiltersReducer,
  locale: localeReducer,
});

const persistConfig = {
  key: 'n5deal',
  version: 2,
  storage,
  whitelist: ['auth', 'filters', 'buyerFilters', 'locale'],
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
