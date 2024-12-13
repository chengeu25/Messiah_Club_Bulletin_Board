import { json } from 'react-router';
import checkUser from '../helper/checkUser';

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

  // Return user status as JSON response
  return json(user, { status: 200 });
};

export default rootLoader;
