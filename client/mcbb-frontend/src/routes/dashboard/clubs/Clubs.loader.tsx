import { json, LoaderFunction, redirect } from 'react-router';
import checkUser from '../../../helper/checkUser';
import { UserType as User } from '../../../types/databaseTypes';

/**
 * Loader function for the clubs dashboard route.
 *
 * @function clubsLoader
 * @returns {Promise<Response>} JSON response with user, active and inactive clubs data, or redirect
 *
 * @description Prepares data for the clubs dashboard by:
 * - Checking user authentication
 * - Verifying email verification status
 * - Fetching active and inactive clubs
 *
 * @throws {Error} Throws an error if clubs cannot be fetched
 *
 * @workflow
 * 1. Check if user is logged in
 * 2. Redirect to login if not authenticated
 * 3. Redirect to email verification if email is not verified
 * 4. Redirect to edit interests if user has no interests
 * 5. Fetch active clubs
 * 6. Fetch inactive clubs (optional)
 * 7. Return user and clubs data
 */
const clubsLoader: LoaderFunction = async () => {
  const user = await checkUser();
  if (user === false) {
    return redirect('/login');
  }
  if ((user as User).emailVerified === false) {
    return redirect('/verifyEmail');
  }
  if (((user as User)?.tags?.length ?? 0) === 0) {
    const message =
      "Please let us know what you're interested in so we can get you connected with the right clubs and events!";
    return redirect(`/editinterest?message=${encodeURIComponent(message)}`);
  }
  const clubsResponse = await fetch(
    `${import.meta.env.VITE_API_BASE_URL}/api/clubs/clubs`,
    {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      }
    }
  );

  if (!clubsResponse.ok) {
    throw new Error('Failed to fetch clubs');
  }

  const inactiveClubsResponse = await fetch(
    `${import.meta.env.VITE_API_BASE_URL}/api/clubs/inactive-clubs`,
    {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      }
    }
  );

  const clubs = await clubsResponse.json();
  const inactiveClubs = inactiveClubsResponse.ok
    ? await inactiveClubsResponse.json()
    : [];
  return json({ user, clubs, inactiveClubs }, { status: 200 });
};

export default clubsLoader;
