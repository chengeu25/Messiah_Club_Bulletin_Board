import { json, LoaderFunction, redirect } from 'react-router';
import checkUser, { User } from '../../../helper/checkUser';

const clubsLoader: LoaderFunction = async () => {
  const user = await checkUser();
  if (user === false) {
    return redirect('/login');
  }
  if ((user as User).emailVerified === false) {
    return redirect('/verifyEmail');
  }
  const clubsResponse = await fetch('http://localhost:3000/api/clubs', {
    method: 'GET',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json'
    }
  });

  if (!clubsResponse.ok) {
    throw new Error('Failed to fetch clubs');
  }

  const clubs = await clubsResponse.json();
  return json({ user: user, clubs: clubs }, { status: 200 });
};

export default clubsLoader;
