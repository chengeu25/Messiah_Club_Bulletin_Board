import { LoaderFunction, redirect } from 'react-router';
import checkUser from '../../../helper/checkUser';
import { UserType } from '../../../types/databaseTypes';

const clubReportsLoader: LoaderFunction = async ({ request, params }) => {
  const user = await checkUser();
  const url = new URL(request.url);
  if (user === false) {
    return redirect('/login?serviceTo=' + url.pathname);
  }
  if (user?.emailVerified === false) {
    return redirect('/verifyEmail');
  }
  if (
    (user as UserType).isFaculty === false &&
    !user.clubAdmins.includes(Number(params.id))
  ) {
    return redirect('/dashboard/home');
  }
  const resp = await fetch(
    `${import.meta.env.VITE_API_BASE_URL}/api/reports/names/CLUB`,
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
    category: 'CLUB'
  };
};

export default clubReportsLoader;
