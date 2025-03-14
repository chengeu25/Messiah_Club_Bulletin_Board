import { json, LoaderFunction, redirect } from 'react-router';
import checkUser from '../../helper/checkUser';

/**
 * Loader function for the account information route.
 *
 * @function accountInfoLoader
 * @returns {Promise<Response>} JSON response with user data or redirect to login
 *
 * @description Checks user authentication before rendering the account info page:
 * 1. Verifies if the user is logged in
 * 2. Redirects to login page if not authenticated
 * 3. Returns user data if authenticated
 *
 * @throws {Error} Redirects to login page if authentication check fails
 */
const accountInfoLoader: LoaderFunction = async ({ request }) => {
  const url = new URL(request.url);
  const user = await checkUser();
  if (user === false || user?.emailVerified === false) {
    return redirect('/login?serviceTo=' + url.pathname);
  }
  return json({ user: user }, { status: 200 });
};

export default accountInfoLoader;
