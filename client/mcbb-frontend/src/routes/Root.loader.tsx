import { json } from 'react-router';
import checkUser from '../helper/checkUser';
import setCSSVars from '../helper/setCSSVars';

/**
 * Root loader function for application-wide user authentication.
 *
 * @function rootLoader
 * @description Checks and provides user authentication status for the entire application
 *
 * @returns {Promise<Response>} JSON response with user authentication details
 *
 * @workflow
 * 1. Invoke user authentication check
 * 2. Return user status as JSON response
 *
 * @features
 * - Global user authentication verification
 * - Centralized authentication state management
 * - Consistent user status reporting
 */
const rootLoader = async () => {
  // Check user authentication status
  const user = await checkUser();

  // If user is false, return immediately
  if (!user) {
    return json({ user: false, school: null }, { status: 200 });
  }

  // Fetch school data
  const schoolResp = await fetch(
    `${import.meta.env.VITE_API_BASE_URL}/api/school/`,
    {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      }
    }
  );

  const school = schoolResp.ok ? await schoolResp.json() : null;
  setCSSVars(school?.color ?? '');

  // Return user status as JSON response
  return json({ user, school }, { status: 200 });
};

export default rootLoader;
