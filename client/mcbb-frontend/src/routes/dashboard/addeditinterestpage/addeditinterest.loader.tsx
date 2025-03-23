// AddedInterest.loader.tsx
import { LoaderFunction, redirect } from 'react-router';
import checkUser from '../../../helper/checkUser';
import { UserType as User } from '../../../types/databaseTypes';

/**
 * Loader function for the add/edit interest dashboard route.
 *
 * @function AddedInterestLoader
 * @returns {Promise<Response>} Redirects based on user authentication status
 *
 * @description Prepares data for the add/edit interest dashboard by:
 * - Checking user authentication
 * - Verifying email verification status
 *
 * @workflow
 * 1. Check if user is logged in
 * 2. Redirect to login if not authenticated
 * 3. Redirect to email verification if email is not verified
 * 4. (Placeholder for future interest data fetching)
 */
const AddedInterestLoader: LoaderFunction = async ({ request }) => {
  const url = new URL(request.url);
  // Check user authentication
  const user = await checkUser();
  if (user === false) {
    return redirect('/login?serviceTo=' + url.pathname);
  }
  if ((user as User).isFaculty === false) {
    return redirect('/dashboard/home');
  }
  if ((user as User).emailVerified === false) {
    return redirect('/verifyEmail');
  }
  return null;
};

export default AddedInterestLoader;
