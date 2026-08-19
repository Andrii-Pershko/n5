import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { api, ApiError } from '@/lib/api';
import type { PublicUser } from '@/lib/types';

type AuthState = {
  token: string | null;
  user: PublicUser | null;
  status: 'idle' | 'loading' | 'error';
  error: string | null;
};

const initialState: AuthState = {
  token: null,
  user: null,
  status: 'idle',
  error: null,
};

export const login = createAsyncThunk(
  'auth/login',
  async (input: { email: string; password: string }, { rejectWithValue }) => {
    try {
      return await api<{ accessToken: string; user: PublicUser }>('/auth/login', {
        method: 'POST',
        body: input,
      });
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Login failed');
    }
  },
);

export const register = createAsyncThunk(
  'auth/register',
  async (
    input: {
      email: string;
      password: string;
      name: string;
      company?: string;
      country?: string;
      role: 'BUYER' | 'SELLER';
    },
    { rejectWithValue },
  ) => {
    try {
      return await api<{ accessToken: string; user: PublicUser }>('/auth/register', {
        method: 'POST',
        body: input,
      });
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Sign up failed');
    }
  },
);

export const fetchMe = createAsyncThunk(
  'auth/me',
  async (_, { getState, rejectWithValue }) => {
    const token = (getState() as { auth: AuthState }).auth.token;
    if (!token) {
      return rejectWithValue('No session');
    }
    try {
      return await api<PublicUser>('/auth/me', { token });
    } catch (error) {
      const status = error instanceof ApiError ? error.status : 500;
      return rejectWithValue(status === 401 ? 'expired' : 'failed');
    }
  },
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout() {
      return initialState;
    },
    clearAuthError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.status = 'idle';
        state.token = action.payload.accessToken;
        state.user = action.payload.user;
      })
      .addCase(login.rejected, (state, action) => {
        state.status = 'error';
        state.error = (action.payload as string) ?? 'Login failed';
      })
      .addCase(register.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.status = 'idle';
        state.token = action.payload.accessToken;
        state.user = action.payload.user;
      })
      .addCase(register.rejected, (state, action) => {
        state.status = 'error';
        state.error = (action.payload as string) ?? 'Sign up failed';
      })
      .addCase(fetchMe.fulfilled, (state, action) => {
        state.user = action.payload;
      })
      .addCase(fetchMe.rejected, (state, action) => {
        if (action.payload === 'expired') {
          state.token = null;
          state.user = null;
        }
      });
  },
});

export const { logout, clearAuthError } = authSlice.actions;
export const authReducer = authSlice.reducer;
