import { LoaderFunction, redirect } from 'react-router';
import checkUser from '../../helper/checkUser';
import { UserType as User } from '../../types/databaseTypes';

/**
 * Loader function for the Edit Interests page.
 * 
 * @function EditInterestLoader
 * @description Prepares data for the Edit Interests page:
 * 1. Checks user authentication and authorization
 * 2. Fetches current user's interests from backend
 * 3. Handles potential errors and redirects
 * 
 * @returns {Promise<Response>} JSON response with current user interests
 * 
 * @workflow
 * 1. Validate user authentication
 * 2. Fetch current user's interests from backend
 * 3. Return interests data
 * 
 * @throws {Error} Redirects to login or verification page if unauthorized
 * @throws {Error} Throws error if fetching interests fails
 */
const EditInterestLoader: LoaderFunction = async () => {
  // Authenticate and verify user
  const user = await checkUser();
  if (user === false) {
    return redirect('/login');
  }
  if ((user as User).emailVerified === false) {
    return redirect('/verifyEmail');
  }

  // Fetch current user's interests from backend
  const response = await fetch(
    `${
      import.meta.env.VITE_API_BASE_URL
    }/api/interests/get-current-user-interests`,
    {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      }
    }
  );

  // Handle interests fetch response
  if (!response.ok) {
    throw new Error('Failed to fetch the interest');
  }
  return await response.json();
};
export default EditInterestLoader;
