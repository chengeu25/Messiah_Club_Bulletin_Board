import { redirect } from 'react-router-dom';
import { AuthSync } from '../../helper/checkUser';

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
  const authSync = AuthSync.getInstance();
  await authSync.performLogout();
  window.location.reload();
  return redirect('/login');
};

export default logoutLoader;
