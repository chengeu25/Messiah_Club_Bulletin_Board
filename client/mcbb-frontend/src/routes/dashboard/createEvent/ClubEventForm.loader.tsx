import { json, LoaderFunction, redirect } from 'react-router';
import checkUser from '../../../helper/checkUser';
import { UserType as User } from '../../../types/databaseTypes';
// import { isAdminForClub } from '../../../helper/clubAdminCheck';

// @ts-ignore
// Remove @ts-ignore when params is actually used, ignoring is necessary to get the project
// to successfully build
const clubEventFormLoader: LoaderFunction = async ({ params }) => {
  const user = await checkUser();
  if (user === false) {
    return redirect('/login');
  }
  if ((user as User).emailVerified === false) {
    return redirect('/verifyEmail');
  }

  // const clubId = params.clubId; // Assuming clubId is passed as a route parameter
  // const isAdmin = await isAdminForClub(user, clubId);
  // if (!isAdmin) {
  //   return redirect('/notAuthorized');
  // }

  return json(
    { user },
    {
      status: 200
    }
  );
};

export default clubEventFormLoader;
