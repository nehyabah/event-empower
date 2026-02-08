import * as SecureStore from 'expo-secure-store';
import type { TokenStorage } from '@event-empower/shared';

const REFRESH_TOKEN_KEY = 'refreshToken';

export const secureTokenStorage: TokenStorage = {
  async getRefreshToken(): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
    } catch {
      return null;
    }
  },

  async setRefreshToken(token: string | null): Promise<void> {
    try {
      if (token) {
        await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, token);
      } else {
        await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
      }
    } catch {
      // Silently fail on storage errors
    }
  },

  async clearAll(): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
    } catch {
      // Silently fail
    }
  },
};
