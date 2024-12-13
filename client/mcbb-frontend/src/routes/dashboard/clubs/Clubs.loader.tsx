import { json, LoaderFunction, redirect } from 'react-router';
import checkUser from '../../../helper/checkUser';
import { UserType as User } from '../../../types/databaseTypes';

const clubsLoader: LoaderFunction = async () => {
  const user = await checkUser();
  if (user === false) {
    return redirect('/login');
  }
  if ((user as User).emailVerified === false) {
    return redirect('/verifyEmail');
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
