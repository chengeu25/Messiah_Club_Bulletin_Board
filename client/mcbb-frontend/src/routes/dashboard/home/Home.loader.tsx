import { json, LoaderFunction, redirect } from 'react-router';
import checkUser, { User } from '../../../helper/checkUser';

const homeLoader: LoaderFunction = async () => {
  const user = await checkUser();
  if (user === false) {
    return redirect('/login');
  }
  if ((user as User).emailVerified === false) {
    return redirect('/verifyEmail');
  }
  return json({ user: user }, { status: 200 });
};

export default homeLoader;
