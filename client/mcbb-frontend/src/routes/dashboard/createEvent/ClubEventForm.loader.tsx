import { json, LoaderFunction, redirect } from 'react-router';
import checkUser from '../../../helper/checkUser';
import { UserType as User, UserType } from '../../../types/databaseTypes';
// import { isAdminForClub } from '../../../helper/clubAdminCheck';

// @ts-ignore
// Remove @ts-ignore when params is actually used, ignoring is necessary to get the project
// to successfully build
const clubEventFormLoader: LoaderFunction = async ({ params, request }) => {
  const user = await checkUser();
  if (user === false) {
    return redirect('/login?serviceTo=' + new URL(request.url).pathname);
  }
  if ((user as User).emailVerified === false) {
    return redirect('/verifyEmail');
  }
  if (
    (user as UserType).isFaculty === false &&
    !user.clubAdmins.includes(Number(params.id))
  ) {
    throw new Response("You aren't allowed in here!", {
      status: 403,
      statusText: 'Forbidden'
    });
  }

  const clubsResponse = await fetch(
    `${import.meta.env.VITE_API_BASE_URL}/api/clubs/clubs`,
    {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      }
    }
  );

  const clubs = await clubsResponse.json();
  // const clubId = params.clubId; // Assuming clubId is passed as a route parameter
  // const isAdmin = await isAdminForClub(user, clubId);
  // if (!isAdmin) {
  //   return redirect('/notAuthorized');
  // }

  return json(
    { user, clubs },
    {
      status: 200
    }
  );
};

export default clubEventFormLoader;
