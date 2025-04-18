import { defer, LoaderFunction, redirect } from 'react-router';
import checkUser from '../../../helper/checkUser';
import {
  ClubType,
  ImageType,
  UserType as User
} from '../../../types/databaseTypes';

const fetchClubLogos = async (
  clubIds: number[],
  isActive: boolean
): Promise<ImageType[]> => {
  try {
    const response = await fetch(
      `${import.meta.env.VITE_API_BASE_URL}/api/clubs/images`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          is_active: isActive,
          club_ids: clubIds
        })
      }
    );
    if (!response.ok) {
      throw new Error('Failed to fetch active club logos');
    }
    const data = (await response.json()) as ImageType[];
    return data;
  } catch (error) {
    console.error('Error fetching active club logos:', error);
    return [];
  }
};

/**
 * Loader function for the clubs dashboard route.
 *
 * @function clubsLoader
 * @param {Object} params - Loader function parameters
 * @param {Request} params.request - The current request object containing URL information
 * @returns {Promise<Response>} JSON response with user, active and inactive clubs data, or redirect
 *
 * @description Prepares data for the clubs dashboard by:
 * - Checking user authentication
 * - Verifying email verification status
 * - Fetching active and inactive clubs
 * - Applying optional search and filter query parameters
 *
 * @throws {Error} Throws an error if clubs cannot be fetched
 *
 * @workflow
 * 1. Check if user is logged in
 * 2. Redirect to login if not authenticated
 * 3. Redirect to email verification if email is not verified
 * 4. Redirect to edit interests if user has no interests
 * 5. Extract search and filter query parameters from URL
 * 6. Fetch active clubs with optional search and filter
 * 7. Fetch inactive clubs with optional search and filter
 * 8. Return user and clubs data
 */
const clubsLoader: LoaderFunction = async ({ request }) => {
  const user = await checkUser();
  if (user === false) {
    return redirect('/login?serviceTo=' + new URL(request.url).pathname);
  }
  if ((user as User).emailVerified === false) {
    return redirect('/verifyEmail');
  }
  if (((user as User)?.tags?.length ?? 0) === 0) {
    const message =
      "Please let us know what you're interested in so we can get you connected with the right clubs and events!";
    return redirect(`/editinterest?message=${encodeURIComponent(message)}`);
  }

  // Extract search and filter query parameters
  const url = new URL(request.url);
  const search = url.searchParams.get('search') || '';
  const filter = url.searchParams.get('filter') || '';

  const clubsResponse = await fetch(
    `${
      import.meta.env.VITE_API_BASE_URL
    }/api/clubs/clubs?search=${encodeURIComponent(
      search
    )}&filter=${encodeURIComponent(filter)}`,
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
    `${
      import.meta.env.VITE_API_BASE_URL
    }/api/clubs/clubs?inactive=true&search=${encodeURIComponent(
      search
    )}&filter=${encodeURIComponent(filter)}`,
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

  const clubLogos =
    clubs.length === 0
      ? new Promise((resolve) => resolve([]))
      : fetchClubLogos(
          clubs.map((club: ClubType) => club.id),
          true
        );
  const inactiveClubLogos =
    !user.isFaculty || inactiveClubs.length === 0
      ? new Promise((resolve) => resolve([]))
      : fetchClubLogos(
          inactiveClubs.map((club: ClubType) => club.id),
          false
        );

  return defer(
    { user, clubs, inactiveClubs, clubLogos, inactiveClubLogos },
    { status: 200 }
  );
};

export default clubsLoader;
