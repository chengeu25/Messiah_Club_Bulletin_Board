import { LoaderFunction, redirect } from 'react-router';
import checkUser from '../../helper/checkUser';
import { UserType as User } from '../../types/databaseTypes';

const EditInterestLoader: LoaderFunction = async () => {
  const user = await checkUser();
  if (user === false) {
    return redirect('/login');
  }
  if ((user as User).emailVerified === false) {
    return redirect('/verifyEmail');
  }
  const response = await fetch(
    'http://localhost:3000/api/interests/get-current-user-interests',
    {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      }
    }
  );
  if (!response.ok) {
    throw new Error('Failed to fetch the interest');
  }
  return await response.json();
};
export default EditInterestLoader;
