import { LoaderFunction, redirect } from 'react-router-dom';
import checkUser from '../../../../helper/checkUser';
import { UserType as User } from '../../../../types/databaseTypes';

/**
 * Loader function for the Club form page.
 *
 * @function clubFormLoader
 * @param {Object} context - Loader function context
 * @param {Object} context.params - Route parameters
 * @param {string} [context.params.id] - Optional club ID for editing
 *
 * @returns {Promise<Response>} JSON response with user, club, and tags data
 *
 * @description Prepares data for the Club form page:
 * 1. Checks user authentication and authorization
 * 2. Fetches available tags
 * 3. Retrieves club details for editing (if ID provided)
 * 4. Handles potential errors and redirects
 *
 * @workflow
 * 1. Validate user authentication
 * 2. Fetch available tags from backend
 * 3. If club ID is provided:
 *    - Verify user permissions
 *    - Fetch club details
 * 4. Return user, club, and tags data
 *
 * @throws {Error} Redirects to login, verification, or clubs page if unauthorized
 * @throws {Error} Throws error if fetching tags or club details fails
 */
const clubFormLoader: LoaderFunction = async ({ params, request }) => {
  // Authenticate and verify user
  const user = await checkUser();
  if (user === false) {
    return redirect('/login?serviceTo=' + new URL(request.url).pathname);
  }
  if ((user as User).emailVerified === false) {
    return redirect('/verifyEmail');
  }

  // Fetch available tags from backend
  const tagsResponse = await fetch(
    `${import.meta.env.VITE_API_BASE_URL}/api/interests/get-available-tags`,
    {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      }
    }
  );

  // Handle tags fetch response
  if (!tagsResponse.ok) {
    throw new Error('Failed to fetch tags');
  }
  const tagsJson = await tagsResponse.json();
  const tagsAvailable = tagsJson.tags.map(
    (tag: { tag: string; tag_id: number }) => ({
      value: tag.tag_id,
      label: tag.tag
    })
  );

  // Check if editing an existing club
  const id = params.id;
  if (id !== undefined) {
    // Verify user permissions for editing
    if (
      !(user as User).isFaculty &&
      !(user as User).clubAdmins.includes(parseInt(id))
    )
      return redirect('/dashboard/clubs');

    // Fetch club details from backend
    const clubResponse = await fetch(
      `${import.meta.env.VITE_API_BASE_URL}/api/clubs/club/${id}`,
      {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    // Handle club fetch response
    if (!clubResponse.ok) {
      throw new Error('Failed to fetch club');
    }

    const club = await clubResponse.json();

    // Return data for the Club form
    return { user, club, tagsAvailable };
  } else if (!(user as User).isFaculty) {
    return redirect('/dashboard/clubs');
  } else return { tagsAvailable };
};

export default clubFormLoader;
