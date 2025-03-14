import { LoaderFunction, redirect } from 'react-router';
import checkUser from '../../../helper/checkUser';
import { UserType } from '../../../types/databaseTypes';

const userReportsLoader: LoaderFunction = async ({ request }) => {
  const user = await checkUser();
  if (user === false) {
    return redirect('/login?serviceTo=' + new URL(request.url).pathname);
  }
  if (user?.emailVerified === false) {
    return redirect('/verifyEmail');
  }
  if ((user as UserType).isFaculty === false) {
    return redirect('/dashboard/home');
  }
  const resp = await fetch(
    `${import.meta.env.VITE_API_BASE_URL}/api/reports/names/USER`,
    {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      }
    }
  );
  if (!resp.ok) {
    return redirect('/dashboard/home');
  }
  const reports = await resp.json();
  return {
    reports: reports.names,
    category: 'USER'
  };
};

export default userReportsLoader;
