import { LoaderFunction, redirect } from 'react-router-dom';
import checkUser from '../../../../helper/checkUser';
import { UserType as User } from '../../../../types/databaseTypes';

/**
 * Loader function for deleting a club.
 *
 * @function deleteClubLoader
 * @param {Object} context - Loader function context
 * @param {Object} context.params - Route parameters
 * @param {string} context.params.id - Club ID to be deleted
 *
 * @returns {Promise<Response>} Redirect response after club deletion
 *
 * @description Handles the club deletion process:
 * 1. Checks user authentication and authorization
 * 2. Confirms deletion with user
 * 3. Sends delete request to backend
 * 4. Redirects to clubs dashboard
 *
 * @workflow
 * 1. Validate user authentication
 * 2. Verify user is faculty
 * 3. Prompt user for deletion confirmation
 * 4. Send delete request to backend
 * 5. Redirect to clubs dashboard
 *
 * @throws {Error} Redirects to login, verification, or clubs page if unauthorized
 * @throws {Error} Throws error if club deletion fails
 */
const deleteClubLoader: LoaderFunction = async ({ params, request }) => {
  // Authenticate and verify user
  const user = await checkUser();
  if (user === false) {
    return redirect('/login?serviceTo=' + new URL(request.url).pathname);
  }
  if ((user as User).emailVerified === false) {
    return redirect('/verifyEmail');
  }

  // Verify user is faculty
  if ((user as User).isFaculty === false) {
    return redirect('/dashboard/clubs');
  }

  // Confirm deletion with user
  const shouldDelete = confirm('Are you sure you want to delete this club?');
  if (!shouldDelete) {
    return redirect('/dashboard/clubs');
  }

  // Send delete request to backend
  const response = await fetch(
    `${import.meta.env.VITE_API_BASE_URL}/api/clubs/delete-club/${params.id}`,
    {
      method: 'DELETE',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      }
    }
  );

  // Handle deletion response
  if (!response.ok) {
    throw new Error('Failed to delete club');
  }

  // Redirect to clubs dashboard
  return redirect('/dashboard/clubs');
};

export default deleteClubLoader;
