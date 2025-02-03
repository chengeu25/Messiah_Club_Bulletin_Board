import { json, LoaderFunction, redirect } from 'react-router';
import checkUser from '../../helper/checkUser';

/**
 * Loader function for the change password route.
 *
 * @function changePasswordLoader
 * @returns {Promise<Response>} JSON response with user data or redirect to login
 *
 * @description Checks user authentication before rendering the change password page:
 * 1. Verifies if the user is logged in
 * 2. Redirects to login page if not authenticated
 * 3. Returns user data if authenticated
 *
 * @throws {Error} Redirects to login page if authentication check fails
 */
const changePasswordLoader: LoaderFunction = async ({ request }) => {
  const user = await checkUser();
  const url = new URL(request.url);
  if (user === false) {
    return redirect('/login?serviceTo=' + url.pathname);
  }
  return json({ user: user }, { status: 200 });
};

export default changePasswordLoader;
