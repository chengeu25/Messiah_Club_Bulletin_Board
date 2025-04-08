import { ActionFunction, redirect } from 'react-router';
import checkUser from '../../../../helper/checkUser';
import { UserType } from '../../../../types/databaseTypes';

const SendEmailLoader: ActionFunction = async ({ request, params }) => {
  const user = await checkUser();
  if (user === false) {
    return redirect('/login?serviceTo=' + new URL(request.url).pathname);
  }
  if (user?.emailVerified === false) {
    return redirect('/verifyEmail');
  }
  if (
    (user as UserType).isFaculty === false &&
    !user.clubAdmins.includes(Number(params.clubId))
  ) {
    throw new Response("You aren't allowed in here!", {
      status: 403,
      statusText: 'Forbidden'
    });
  }
  return null;
};

export default SendEmailLoader;
