import { json, LoaderFunction, redirect } from 'react-router';
import checkUser from '../../../helper/checkUser';
import { UserType as User } from '../../../types/databaseTypes';

/**
 * Loader function for the assign faculty dashboard route.
 *
 * @function assignFacultyLoader
 * @returns {Promise<Response>} JSON response with user data, or redirect
 *
 * @description Prepares data for the assign faculty dashboard by:
 * - Checking user authentication
 * - Verifying user's faculty status
 *
 * @workflow
 * 1. Check if user is logged in
 * 2. Redirect to login if not authenticated
 * 3. Redirect to home dashboard if user is not faculty
 * 4. Return user data
 */
const assignFacultyLoader: LoaderFunction = async ({ request }) => {
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
  return json({ user: user }, { status: 200 });
};

export default assignFacultyLoader;
