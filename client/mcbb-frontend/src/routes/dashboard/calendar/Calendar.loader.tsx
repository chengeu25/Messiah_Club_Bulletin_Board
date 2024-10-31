import { json, LoaderFunction, redirect } from 'react-router';
import checkUser from '../../../helper/checkUser';

const calendarLoader: LoaderFunction = async () => {
  const user = await checkUser();
  if (user === false) {
    return redirect('/login');
  }
  return json({ user: user }, { status: 200 });
};

export default calendarLoader;
