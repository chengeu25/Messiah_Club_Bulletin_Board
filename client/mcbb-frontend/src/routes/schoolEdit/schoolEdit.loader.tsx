import { json, LoaderFunction, redirect } from 'react-router-dom';
import checkUser from '../../helper/checkUser';
import { UserType as User } from '../../types/databaseTypes';

const schoolEditloader: LoaderFunction = async ({ request }) => {
  const user = await checkUser();
  if (user === false) {
    return redirect('/login?serviceTo=' + new URL(request.url).pathname);
  }
  if (user?.emailVerified === false) {
    return redirect('/verifyEmail');
  }
  if ((user as User).isFaculty === false) {
    throw new Response('You need faculty privileges to access this page', {
      status: 403,
      statusText: 'Forbidden'
    });
  }

  try {
    const response = await fetch(
      `${import.meta.env.VITE_API_BASE_URL}/api/school`,
      {
        method: 'GET',
        credentials: 'include'
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch school data');
    }
    const schoolData = await response.json();
    return json(schoolData);
  } catch (error) {
    console.error('Error fetching school data:', error);
    return json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
};

export default schoolEditloader;
