'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { translate } from '@/i18n/translate';
import { setUnauthorizedHandler } from '@/lib/api';
import { fetchMe, logout } from './slices/authSlice';
import { persistor, store } from './store';

function restoringLabel() {
  return translate(store.getState().locale.locale, 'sessionRestoring');
}

function SessionBootstrap({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(() => !store.getState().auth.token);

  useEffect(() => {
    setUnauthorizedHandler(() => {
      store.dispatch(logout());
    });
    const token = store.getState().auth.token;
    if (!token) {
      setReady(true);
      return () => setUnauthorizedHandler(null);
    }
    void store.dispatch(fetchMe()).finally(() => setReady(true));
    return () => setUnauthorizedHandler(null);
  }, []);

  if (!ready) {
    return (
      <div className="grid min-h-screen place-items-center text-sm text-muted">
        {restoringLabel()}
      </div>
    );
  }

  return <>{children}</>;
}

export function StoreProvider({ children }: { children: ReactNode }) {
  return (
    <Provider store={store}>
      <PersistGate
        loading={
          <div className="grid min-h-screen place-items-center text-sm text-muted">
            {restoringLabel()}
          </div>
        }
        persistor={persistor}
      >
        <SessionBootstrap>{children}</SessionBootstrap>
      </PersistGate>
    </Provider>
  );
}
