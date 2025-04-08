import { LoaderFunction, redirect } from 'react-router';
import checkUser from '../../helper/checkUser';
import { UserType } from '../../types/databaseTypes';

const facultyLoader: LoaderFunction = async ({ request }) => {
  const user = await checkUser();
  if (user === false) {
    return redirect('/login?serviceTo=' + new URL(request.url).pathname);
  }
  if (user?.emailVerified === false) {
    return redirect('/verifyEmail');
  }
  if ((user as UserType).isFaculty === false) {
    throw new Response('You need faculty privileges to access this page', {
      status: 403,
      statusText: 'Forbidden'
    });
  }
  return user;
};

export default facultyLoader;
