import Constants from 'expo-constants';

// In development, use your local machine's IP
// In production, use the actual API URL
const DEV_API_URL = 'http://192.168.1.100:3001/api';

export const API_URL =
  Constants.expoConfig?.extra?.apiUrl ||
  (process.env.EXPO_PUBLIC_API_URL as string) ||
  DEV_API_URL;

export const APP_SCHEME = 'eventempower';
