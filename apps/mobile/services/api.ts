import { createApiClient, createAuthService, createVendorService, createStoryService, createRsvpService } from '@event-empower/shared';
import { secureTokenStorage } from './tokenStorage';
import { API_URL } from '../constants/config';

export const apiClient = createApiClient({
  baseUrl: API_URL,
  tokenStorage: secureTokenStorage,
  useCookies: false, // Mobile uses body-based refresh
});

export const authService = createAuthService(apiClient);
export const vendorService = createVendorService(apiClient);
export const storyService = createStoryService(apiClient);
export const rsvpService = createRsvpService(apiClient);
