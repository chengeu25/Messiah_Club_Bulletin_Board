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
    return redirect('/dashboard/home');
  }
  return user;
};

export default facultyLoader;
