import { json, LoaderFunction, redirect } from 'react-router';
import checkUser from '../../../helper/checkUser';
import { UserType as User } from '../../../types/databaseTypes';

const clubLoader: LoaderFunction = async ({ params }) => {
  const user = await checkUser();
  if (user === false) {
    return redirect('/login');
  }
  if ((user as User).emailVerified === false) {
    return redirect('/verifyEmail');
  }
  if (params.id === undefined) {
    return redirect('/dashboard/clubs/new');
  }
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

  if (!clubResp.ok) {
    return null;
  }

  const club = await clubResp.json();

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

  const eventsJson = await eventsResp.json();
  const events = eventsResp.ok ? eventsJson?.events : [];

  return json(
    { user, club, events },
    {
      status: 200
    }
  );
};

export default clubLoader;
