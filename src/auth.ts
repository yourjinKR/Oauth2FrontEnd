export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080';

export const ACCESS_TOKEN_STORAGE_KEY = 'knockin-test-access-token';
export const LOGIN_METHOD_STORAGE_KEY = 'knockin-test-login-method';

export type LoginMethod = 'sdk' | 'oauth2';

export interface CommonResponse<T> {
  status: number;
  data: T | null;
  error: {
    code: string;
    message: string;
  } | null;
}

export interface AuthResponse {
  accessToken: string;
  basicInfo: boolean;
  preferenceInfo: boolean;
}

export const getStoredAccessToken = () =>
  sessionStorage.getItem(ACCESS_TOKEN_STORAGE_KEY);

export const clearStoredAuth = () => {
  sessionStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY);
  sessionStorage.removeItem(LOGIN_METHOD_STORAGE_KEY);
};
