import { json, LoaderFunction, redirect } from 'react-router';
import checkUser, { User } from '../../../helper/checkUser';

const clubEventFormLoader: LoaderFunction = async () => {
  const user = await checkUser();
  if (user === false) {
    return redirect('/login');
  }
  if ((user as User).emailVerified === false) {
    return redirect('/verifyEmail');
  }

  return json(
    { user },
    {
      status: 200
    }
  );
};

export default clubEventFormLoader;