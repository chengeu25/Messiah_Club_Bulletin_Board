import { json, LoaderFunction, redirect } from 'react-router';
import checkUser, { User } from '../../../helper/checkUser';

const clubLoader: LoaderFunction = async ({ params }) => {
  const user = await checkUser();
  if (user === false) {
    return redirect('/login');
  }
  if ((user as User).emailVerified === false) {
    return redirect('/verifyEmail');
  }
  const clubResp = await fetch(`http://localhost:3000/api/club/${params.id}`, {
    method: 'GET',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json'
    }
  });

  if (!clubResp.ok) {
    throw new Error('Failed to fetch club');
  }

  const club = await clubResp.json();
  return json(
    { user, club },
    {
      status: 200
    }
  );
};

export default clubLoader;
