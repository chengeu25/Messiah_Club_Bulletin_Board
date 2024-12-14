import { redirect } from 'react-router-dom';

/**
 * Logout loader for handling user session termination.
 *
 * @function logoutLoader
 * @returns {Promise<Response>} Redirect response to login page
 *
 * @description Handles user logout process by:
 * 1. Sending logout request to backend
 * 2. Clearing user authentication
 * 3. Redirecting to login page
 *
 * @workflow
 * 1. Send logout request to backend
 * 2. Clear user authentication cookies (on backend)
 * 3. Redirect to login page
 *
 * @features
 * - Secure session termination
 * - Consistent logout experience
 * - Automatic redirection after logout
 */
const logoutLoader = async () => {
  // Send logout request to backend
  await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/auth/logout`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json'
    }
  });

  // Redirect to login page with a cache-busting parameter
  return redirect('/login?_reload=' + Date.now());
};

export default logoutLoader;
