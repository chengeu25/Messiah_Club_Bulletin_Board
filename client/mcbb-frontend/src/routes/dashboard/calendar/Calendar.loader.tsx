import { json, LoaderFunction, redirect } from 'react-router';
import checkUser from '../../../helper/checkUser';
import { UserType as User } from '../../../types/databaseTypes';
import { subtractDays } from '../../../helper/dateUtils';

const calendarLoader: LoaderFunction = async ({ request }) => {
  const url = new URL(request.url);
  const searchParams = new URLSearchParams(url.search);

  const user = await checkUser();
  if (user === false) {
    return redirect('/login');
  }
  if ((user as User).emailVerified === false) {
    return redirect('/verifyEmail');
  }

  const startingDate = searchParams.get('startingDate');
  const numDays = searchParams.get('numDays');

  const response = await fetch(
    `http://localhost:3000/api/events?start_date=${encodeURIComponent(
      startingDate ?? new Date().toISOString()
    )}&end_date=${encodeURIComponent(
      subtractDays(
        new Date(startingDate ?? new Date().toISOString()),
        -(numDays ?? 1)
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

export default calendarLoader;
