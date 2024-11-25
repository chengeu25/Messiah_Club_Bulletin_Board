// AddedInterest.loader.tsx
import { LoaderFunction, redirect } from 'react-router';
import checkUser from '../../../helper/checkUser';
import { UserType as User } from '../../../types/databaseTypes';

const AddedInterestLoader: LoaderFunction = async () => {
  // Check user authentication
  const user = await checkUser();
  if (user === false) {
    return redirect('/login');
  }
  if ((user as User).emailVerified === false) {
    return redirect('/verifyEmail');
  }

  // Simulate fetching existing interest data
  // Replace with your actual API call to fetch interest data
}

export default AddedInterestLoader;
