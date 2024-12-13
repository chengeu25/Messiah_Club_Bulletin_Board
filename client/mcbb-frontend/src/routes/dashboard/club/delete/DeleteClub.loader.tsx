import { LoaderFunction, redirect } from 'react-router-dom';
import checkUser from '../../../../helper/checkUser';
import { UserType as User } from '../../../../types/databaseTypes';

const deleteClubLoader: LoaderFunction = async ({ params }) => {
  const user = await checkUser();
  if (user === false) {
    return redirect('/login');
  }
  if ((user as User).emailVerified === false) {
    return redirect('/verifyEmail');
  }
  if ((user as User).isFaculty === false) {
    return redirect('/dashboard/clubs');
  }
  const shouldDelete = confirm('Are you sure you want to delete this club?');
  if (!shouldDelete) {
    return redirect('/dashboard/clubs');
  }
  const response = await fetch(
    `${import.meta.env.VITE_API_BASE_URL}/api/clubs/delete-club/${params.id}`,
    {
      method: 'DELETE',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      }
    }
  );
  if (!response.ok) {
    throw new Error('Failed to delete club');
  }
  return redirect('/dashboard/clubs');
};

export default deleteClubLoader;
