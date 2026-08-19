const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

let unauthorizedHandler: (() => void) | null = null;

export function setUnauthorizedHandler(handler: (() => void) | null) {
  unauthorizedHandler = handler;
}

type ApiOptions = {
  method?: string;
  body?: unknown;
  token?: string | null;
};

export async function api<T>(path: string, options: ApiOptions = {}): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    method: options.method ?? 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}),
    },
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
  });

  const payload: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    const message = readErrorMessage(payload) || response.statusText;
    if (response.status === 401 && path !== '/auth/login') {
      unauthorizedHandler?.();
    }
    throw new ApiError(message, response.status);
  }
  return payload as T;
}

function readErrorMessage(payload: unknown): string {
  if (!payload || typeof payload !== 'object') {
    return '';
  }
  const message = (payload as { message?: string | string[] }).message;
  if (Array.isArray(message)) {
    return message.join('; ');
  }
  return message ?? '';
}

export function queryString(params: Record<string, string | number | undefined | null>) {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== '') {
      search.set(key, String(value));
    }
  }
  const qs = search.toString();
  return qs ? `?${qs}` : '';
}
