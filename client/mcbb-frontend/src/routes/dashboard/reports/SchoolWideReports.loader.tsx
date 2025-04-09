import { LoaderFunction, redirect } from 'react-router';
import checkUser from '../../../helper/checkUser';
import { UserType } from '../../../types/databaseTypes';

const facultyReportsLoader: LoaderFunction = async ({ request }) => {
  const user = await checkUser();
  if (user === false) {
    return redirect('/login?serviceTo=' + new URL(request.url).pathname);
  }
  if (user?.emailVerified === false) {
    return redirect('/verifyEmail');
  }
  if ((user as UserType).isFaculty === false) {
    throw new Response('You need faculty privileges to access this page.', {
      status: 403,
      statusText: 'Forbidden'
    });
  }
  const resp = await fetch(
    `${import.meta.env.VITE_API_BASE_URL}/api/reports/names/SCHOOL_WIDE`,
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
  console.log(reports);
  return {
    reports: reports.names,
    category: 'SCHOOL_WIDE'
  };
};

export default facultyReportsLoader;
