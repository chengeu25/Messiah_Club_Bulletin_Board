import { json, LoaderFunction, redirect } from 'react-router';
import checkUser from '../../../helper/checkUser';
import { UserType as User } from '../../../types/databaseTypes';

const eventLoader: LoaderFunction = async ({ params }) => {
  const { id } = params;
  const user = await checkUser();
  if (user === false) {
    return redirect('/login');
  }
  if ((user as User).emailVerified === false) {
    return redirect('/verifyEmail');
  }
  const response = await fetch(`http://localhost:3000/api/event/${id}`, {
    method: 'GET',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    throw new Error('Failed to fetch event');
  }

  const eventJson = await response.json();
  const event = eventJson?.event;

  console.log(event);

  return json({ user, event }, { status: 200 });
};

export default eventLoader;
