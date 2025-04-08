import { json, LoaderFunction, redirect } from 'react-router-dom';
import checkUser from '../../../helper/checkUser';
import { UserType as User } from '../../../types/databaseTypes';

/**
 * Loader function for the admin user form dashboard route.
 *
 * @function adminUserFormLoader
 * @returns {Promise<Response>} JSON response with user data, or redirect
 *
 * @description Prepares data for the admin user form dashboard by:
 * - Checking user authentication
 * - Verifying user's faculty status
 * - Fetching users based on search query
 */

const adminUserFormLoader: LoaderFunction = async ({ request }) => {
  const user = await checkUser();
  if (user === false || user?.emailVerified === false) {
    return redirect('/login?serviceTo=' + new URL(request.url).pathname);
  }
  if ((user as User).isFaculty === false) {
    throw new Response('You need faculty privileges to access this page', {
      status: 403,
      statusText: 'Forbidden'
    });
  }

  const url = new URL(request.url);
  const searchQuery = url.searchParams.get('search') || '';

  try {
    const response = await fetch(
      `${
        import.meta.env.VITE_API_BASE_URL
      }/api/admintools/get-users?search=${encodeURIComponent(searchQuery)}`,
      {
        method: 'GET',
        credentials: 'include'
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch users');
    }

    const users = await response.json();

    return json(
      {
        user: user,
        users: users,
        searchQuery: searchQuery
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching users:', error);
    return json(
      {
        user: user,
        users: [],
        searchQuery: searchQuery,
        error: 'Failed to fetch users'
      },
      { status: 500 }
    );
  }
};

export default adminUserFormLoader;
