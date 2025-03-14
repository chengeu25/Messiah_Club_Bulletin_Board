import { json, LoaderFunction } from 'react-router';
import checkUser from '../helper/checkUser';
import setCSSVars from '../helper/setCSSVars';

/**
 * Determine the current page name based on the route
 *
 * @returns {string} The page name for preference fetching
 */
const getCurrentPageName = (pathname: string): string => {
  const pageMapping: { [key: string]: string } = {
    '/dashboard/home': 'home',
    '/dashboard/calendar': 'calendar',
    '/dashboard/clubs': 'clubs'
  };

  return pageMapping[pathname] || 'none'; // Default to null if no match
};

/**
 * Fetch user preferences for a specific page
 *
 * @param page The page to fetch preferences for
 * @returns User preferences or null if fetch fails
 */
const fetchPagePreferences = async (page: string) => {
  try {
    const prefsResp = await fetch(
      `${import.meta.env.VITE_API_BASE_URL}/api/prefs/${page}`,
      {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    if (!prefsResp.ok) {
      console.error(
        `Error fetching ${page} preferences:`,
        await prefsResp.json()
      );
    }

    return prefsResp.ok ? await prefsResp.json() : null;
  } catch (error) {
    console.error(`Error fetching ${page} preferences:`, error);
    return null;
  }
};

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
 * 2. Fetch school data
 * 3. Fetch page preferences
 * 4. Return comprehensive application state
 *
 * @features
 * - Global user authentication verification
 * - Centralized authentication state management
 * - Page-specific preference retrieval
 */
const rootLoader: LoaderFunction = async ({ request }) => {
  // Check user authentication status
  const user = await checkUser();

  // If user is false, return immediately
  if (!user) {
    return json({ user: false, school: null, prefs: null }, { status: 200 });
  }

  const url = new URL(request.url);

  // Fetch school data
  const schoolResp =
    url.pathname === '/' || url.pathname === '' || url.pathname === '/logout'
      ? null
      : await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/school/`, {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json'
          }
        });

  if (schoolResp === null) {
    return json({ user, school: null, prefs: null }, { status: 200 });
  }
  const school = schoolResp.ok ? await schoolResp.json() : null;
  setCSSVars(school?.color ?? '');

  // Determine current page and fetch preferences
  const currentPage = getCurrentPageName(url.pathname);
  const prefs =
    currentPage === 'none' ? null : await fetchPagePreferences(currentPage);

  // Return comprehensive application state
  return json({ user, school, prefs }, { status: 200 });
};

export default rootLoader;
