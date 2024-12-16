import { json, LoaderFunction, redirect } from 'react-router';
import checkUser from '../../../helper/checkUser';
import { UserType as User } from '../../../types/databaseTypes';

/**
 * Loader function for the Club details page.
 * 
 * @function clubLoader
 * @param {Object} context - Loader function context
 * @param {Object} context.params - Route parameters
 * @param {string} context.params.id - Club ID from route
 * 
 * @returns {Promise<Response>} JSON response with user, club, and events data
 * 
 * @description Prepares data for the Club details page:
 * 1. Checks user authentication and email verification
 * 2. Fetches club details by ID
 * 3. Retrieves upcoming events for the club
 * 4. Handles potential errors and redirects
 * 
 * @workflow
 * 1. Validate user authentication
 * 2. Verify club ID is present
 * 3. Fetch club details from backend
 * 4. Fetch upcoming club events
 * 5. Return user, club, and events data
 * 
 * @throws {Error} Redirects to login or verification page if authentication fails
 */
const clubLoader: LoaderFunction = async ({ params }) => {
  // Authenticate and verify user
  const user = await checkUser();
  if (user === false) {
    return redirect('/login');
  }
  if ((user as User).emailVerified === false) {
    return redirect('/verifyEmail');
  }

  // Validate club ID
  if (params.id === undefined) {
    return redirect('/dashboard/clubs/new');
  }

  // Fetch club details from backend
  const clubResp = await fetch(
    `${import.meta.env.VITE_API_BASE_URL}/api/clubs/club/${params.id}`,
    {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      }
    }
  );

  // Handle club fetch errors
  if (!clubResp.ok) {
    return null;
  }

  const club = await clubResp.json();

  // Fetch upcoming events for the club
  const eventsResp = await fetch(
    `${import.meta.env.VITE_API_BASE_URL}/api/events/club-events/${
      params.id
    }?start_date=${new Date(new Date().setHours(0, 0, 0, 0)).toISOString()}`,
    {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      }
    }
  );

  // Process events response
  const eventsJson = await eventsResp.json();
  const events = eventsResp.ok ? eventsJson?.events : [];

  // Return data for the Club page
  return json(
    { user, club, events },
    {
      status: 200
    }
  );
};

export default clubLoader;
