import PocketBase from 'pocketbase';
import { environment } from '../../../environments/environment';

// Create a single instance of PocketBase
const pb = new PocketBase(environment.apiUrl);

// Enable auto-refresh of auth token
pb.autoCancellation(false);

// Log auth store changes
pb.authStore.onChange(() => {
  console.log('Auth store changed:', pb.authStore.model);
}, true);

/**
 * Check if user is logged in
 */
export const isLoggedIn = (): boolean => {
  console.log('Checking if user is logged in:', pb.authStore.isValid);
  return pb.authStore.isValid;
};

/**
 * Logout the current user
 */
export const logout = (): void => {
  console.log('Logging out user');
  pb.authStore.clear();
  console.log('User logged out, is authenticated:', pb.authStore.isValid);
};

/**
 * Get the current user data
 */
export const getCurrentUser = () => {
  return pb.authStore.model;
};

/**
 * Make an authenticated request to PocketBase
 */
export const authenticatedRequest = async (collection: string, options: any) => {
  try {
    console.log(`Making request to ${collection}`, options);
    const result = await pb.collection(collection).getList(1, 30, options);
    console.log('Request successful:', result);
    return result;
  } catch (error) {
    console.error('PocketBase request error:', error);
    throw error;
  }
};

export { pb };
