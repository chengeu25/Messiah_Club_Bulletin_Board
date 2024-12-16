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
  const school = await fetch(
    `${import.meta.env.VITE_API_BASE_URL}/api/school/1`,
    {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      }
    }
  ).then((res) => res.json());
  console.log(school);

  // Return user status as JSON response
  return json(user, { status: 200 });
};

// Add a function to handle loader reloading
const handleRootLoaderReload = async () => {
  try {
    // Re-check user authentication
    const user = await checkUser();

    // Optionally, you can dispatch a custom event to notify components about the reload
    window.dispatchEvent(
      new CustomEvent('root-loader-reloaded', {
        detail: { user }
      })
    );
  } catch (error) {
    console.error('Error reloading root loader:', error);
  }
};

// Add event listener for loader reload
window.addEventListener('reload-root-loader', handleRootLoaderReload);

export default rootLoader;
