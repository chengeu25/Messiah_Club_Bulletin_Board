import { json, LoaderFunction, redirect } from 'react-router';
import checkUser from '../../../helper/checkUser';
import { UserType as User } from '../../../types/databaseTypes';

/**
 * Loader function for the home dashboard route.
 * 
 * @function homeLoader
 * @returns {Promise<Response>} JSON response with user and events data, or redirect
 * 
 * @description Prepares data for the home dashboard by:
 * - Checking user authentication
 * - Verifying email verification status
 * - Fetching events for the current week
 * 
 * @throws {Error} Throws an error if events cannot be fetched
 * 
 * @workflow
 * 1. Check if user is logged in
 * 2. Redirect to login if not authenticated
 * 3. Redirect to email verification if email is not verified
 * 4. Fetch events for the next 7 days
 * 5. Return user and events data
 */
const homeLoader: LoaderFunction = async () => {
  const user = await checkUser();
  if (user === false) {
    return redirect('/login');
  }
  if ((user as User).emailVerified === false) {
    return redirect('/verifyEmail');
  }
  const response = await fetch(
    `${import.meta.env.VITE_API_BASE_URL}/api/events/events?start_date=${encodeURIComponent(
      new Date().toISOString()
    )}&end_date=${encodeURIComponent(
      new Date(
        new Date(new Date().setHours(0, 0, 0, 0)).getTime() +
          7 * 24 * 60 * 60 * 1000
      ).toISOString()
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
