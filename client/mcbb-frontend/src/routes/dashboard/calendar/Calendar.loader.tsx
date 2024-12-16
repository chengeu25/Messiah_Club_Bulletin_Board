import { json, LoaderFunction, redirect } from 'react-router';
import checkUser from '../../../helper/checkUser';
import { UserType as User } from '../../../types/databaseTypes';
import { subtractDays } from '../../../helper/dateUtils';

/**
 * Loader function for the Calendar route.
 *
 * @function calendarLoader
 * @param {Object} context - Loader function context
 * @param {Request} context.request - The current request
 *
 * @returns {Promise<Response>} JSON response with user and events data
 *
 * @description Handles the loading process for the Calendar route:
 * 1. Checks user authentication and verification
 * 2. Retrieves events for the specified date range
 * 3. Handles potential errors and redirects
 *
 * @workflow
 * 1. Validate user authentication
 * 2. Redirect to edit interests if user has no interests
 * 2. Extract date parameters from URL
 * 3. Fetch events from backend API
 * 4. Return user and events data
 */
const calendarLoader: LoaderFunction = async ({ request }) => {
  // Parse URL and search parameters
  const url = new URL(request.url);
  const searchParams = new URLSearchParams(url.search);

  // Authenticate and verify user
  const user = await checkUser();
  if (user === false) {
    return redirect('/login');
  }
  if ((user as User).emailVerified === false) {
    return redirect('/verifyEmail');
  }

  // Redirect to edit interests if user has no interests
  if (((user as User)?.tags?.length ?? 0) === 0) {
    const message =
      "Please let us know what you're interested in so we can get you connected with the right clubs and events!";
    return redirect(`/editinterest?message=${encodeURIComponent(message)}`);
  }

  // Determine starting date and number of days to display
  const startingDate =
    searchParams.get('startingDate') ??
    new Date(new Date().setHours(0, 0, 0, 0)).toLocaleDateString();
  const numDays = searchParams.get('numDays') ?? 1;

  // Fetch events from backend API
  const response = await fetch(
    `${
      import.meta.env.VITE_API_BASE_URL
    }/api/events/events?start_date=${encodeURIComponent(
      new Date(startingDate).toISOString()
    )}&end_date=${encodeURIComponent(
      subtractDays(new Date(startingDate), -numDays).toISOString()
    )}`,
    {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      }
    }
  );

  // Handle API response
  if (!response.ok) {
    throw new Error('Failed to fetch events');
  }

  // Parse events from response
  const eventsJson = await response.json();
  const events = eventsJson?.events;

  // Return user and events data
  return json({ user, events }, { status: 200 });
};

export default calendarLoader;
