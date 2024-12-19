import { redirect } from 'react-router-dom';

/**
 * Logout loader for handling user session termination.
 *
 * @function logoutLoader
 * @returns {Promise<Response>} Redirect response to login page
 *
 * @description Handles user logout process by:
 * 1. Sending logout request to backend
 * 2. Redirecting to login page
 *
 * @workflow
 * 1. Send logout request to backend
 * 2. Redirect to login page
 *
 * @features
 * - Secure session termination
 * - Consistent logout experience
 * - Automatic redirection after logout
 */
const logoutLoader = async () => {
  try {
    // Send logout request to backend
    const response = await fetch(
      `${import.meta.env.VITE_API_BASE_URL}/api/auth/logout`,
      {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    // Ensure logout was successful
    if (!response.ok) {
      throw new Error(`Logout failed: ${response.statusText}`);
    }

    // Direct, clean redirect to login
    return redirect('/');
  } catch (error) {
    console.error('Logout Error:', error);
    return redirect('/');
  }
};

export default logoutLoader;
