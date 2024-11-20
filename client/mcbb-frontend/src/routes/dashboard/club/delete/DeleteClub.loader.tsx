import { LoaderFunction, redirect } from 'react-router-dom';
import checkUser, { User } from '../../../../helper/checkUser';

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
    `http://localhost:3000/api/delete-club/${params.id}`,
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
