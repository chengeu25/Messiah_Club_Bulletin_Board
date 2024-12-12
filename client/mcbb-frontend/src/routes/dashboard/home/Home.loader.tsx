import { json, LoaderFunction, redirect } from 'react-router';
import checkUser from '../../../helper/checkUser';
import { UserType as User } from '../../../types/databaseTypes';

const homeLoader: LoaderFunction = async () => {
  const user = await checkUser();
  if (user === false) {
    return redirect('/login');
  }
  if ((user as User).emailVerified === false) {
    return redirect('/verifyEmail');
  }
  const response = await fetch(
    `http://localhost:3000/api/events?start_date=${encodeURIComponent(
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
