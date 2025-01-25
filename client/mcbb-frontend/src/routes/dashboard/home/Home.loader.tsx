import { json, LoaderFunction, redirect } from 'react-router';
import checkUser from '../../../helper/checkUser';
import { UserType as User } from '../../../types/databaseTypes';

/**
 * Loader function for the home dashboard route.
 *
 * @function homeLoader
 * @param {Object} params - Loader function parameters
 * @param {Request} params.request - The current request object containing URL information
 * @returns {Promise<Response>} JSON response with user and events data, or redirect
 *
 * @description Prepares data for the home dashboard by:
 * - Checking user authentication
 * - Verifying email verification status
 * - Extracting search and filter parameters from URL
 * - Fetching events for the current week based on search and filter criteria
 *
 * @throws {Error} Throws an error if events cannot be fetched
 *
 * @workflow
 * 1. Check if user is logged in
 * 2. Redirect to login if not authenticated
 * 3. Redirect to email verification if email is not verified
 * 4. Redirect to edit interests if user has no interests
 * 5. Extract search and filter parameters from URL
 * 6. Fetch events for the next 7 days, filtered by search and filter parameters
 * 7. Return user and events data
 */
const homeLoader: LoaderFunction = async ({ request }) => {
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

  // Extract search and filter parameters from the URL
  const url = new URL(request.url);
  const searchParam = url.searchParams.get('search') || '';
  const filterParam = url.searchParams.get('filter') || '';

  const response = await fetch(
    `${
      import.meta.env.VITE_API_BASE_URL
    }/api/events/events?start_date=${encodeURIComponent(
      new Date().toISOString()
    )}&end_date=${encodeURIComponent(
      new Date(
        new Date(new Date().setHours(0, 0, 0, 0)).getTime() +
          7 * 24 * 60 * 60 * 1000
      ).toISOString()
    )}&search=${encodeURIComponent(searchParam)}&filter=${encodeURIComponent(
      filterParam
    )}`,
    {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      }
    }
  );

  if (!response.ok) {
    throw new Error('Failed to fetch events');
  }

  const eventsJson = await response.json();
  const events = eventsJson?.events;
  return json({ user, events }, { status: 200 });
};

export default homeLoader;
