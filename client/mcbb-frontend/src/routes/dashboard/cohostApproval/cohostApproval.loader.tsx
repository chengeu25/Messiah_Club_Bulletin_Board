import { json, LoaderFunction, redirect } from 'react-router';
import checkUser from '../../../helper/checkUser';
import { UserType as User } from '../../../types/databaseTypes';

const cohostApprovalLoader: LoaderFunction = async ({ params }) => {
  const user = await checkUser();
  if (user === false) return redirect('/login');
  if ((user as User).emailVerified === false) return redirect('/verifyEmail');

  const eventResponse = await fetch(
    `${import.meta.env.VITE_API_BASE_URL}/api/events/${params.eventId}`,
    {
      method: 'GET',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
    }
  );

  if (!eventResponse.ok) {
    return json({ error: 'Event not found' }, { status: 404 });
  }

  const event = await eventResponse.json();

  return json({ user, event }, { status: 200 });
};

export default cohostApprovalLoader;
