import { json, LoaderFunction, redirect } from 'react-router';
import checkUser from '../../../helper/checkUser';
import { UserType as User } from '../../../types/databaseTypes';

/**
 * Loader function for the Event details page.
 *
 * @function eventLoader
 * @param {Object} context - Loader function context
 * @param {Object} context.params - Route parameters
 * @param {string} context.params.id - Event ID to fetch details for
 *
 * @returns {Promise<Response>} JSON response with user and event details
 *
 * @description Prepares data for the Event details page:
 * 1. Checks user authentication and authorization
 * 2. Fetches event details from backend
 * 3. Handles potential errors and redirects
 *
 * @workflow
 * 1. Validate user authentication
 * 2. Fetch event details using event ID
 * 3. Return user and event data
 *
 * @throws {Error} Redirects to login or verification page if unauthorized
 * @throws {Error} Throws error if fetching event details fails
 */
const eventLoader: LoaderFunction = async ({ params, request }) => {
  // Extract event ID from route parameters
  const { id } = params;

  // Authenticate and verify user
  const user = await checkUser();
  if (user === false) {
    return redirect('/login?serviceTo=' + new URL(request.url).pathname);
  }
  if ((user as User).emailVerified === false) {
    return redirect('/verifyEmail');
  }

  // Fetch event details from backend
  const response = await fetch(
    `${import.meta.env.VITE_API_BASE_URL}/api/events/event/${id}`,
    {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      }
    }
  );

  // Handle event fetch response
  if (!response.ok) {
    throw new Error('Failed to fetch event');
  }

  const eventJson = await response.json();
  const event = eventJson?.event;

  const commentResponse = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/events/get-comments/${id}`, {
    method: 'GET',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json'
    }
  });

  // Handle comment fetch response
  if (!commentResponse.ok) { 
    throw new Error('Failed to fetch comments');
  }

  const commentJson = await commentResponse.json();
  const comments = commentJson?.comments;

  // Return user and event data
  return json({ user, event, comments }, { status: 200 });
};

export default eventLoader;
