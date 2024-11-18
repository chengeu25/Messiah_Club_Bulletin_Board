import { LoaderFunction, redirect } from 'react-router-dom';
import checkUser, { User } from '../../../../helper/checkUser';

const clubFormLoader: LoaderFunction = async ({ params }) => {
  const user = await checkUser();
  if (user === false) {
    return redirect('/login');
  }
  if ((user as User).emailVerified === false) {
    return redirect('/verifyEmail');
  }
  const id = params.id;
  console.log(id);
  if (id !== undefined) {
    if (
      !(user as User).isFaculty &&
      !(user as User).clubAdmins.includes(parseInt(id))
    )
      return redirect('/dashboard/clubs');
    const clubResponse = await fetch(`http://localhost:3000/api/club/${id}`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    if (!clubResponse.ok) {
      throw new Error('Failed to fetch club');
    }
    const club = await clubResponse.json();
    return club;
  } else if (!(user as User).isFaculty) {
    return redirect('/dashboard/clubs');
  } else return null;
};

export default clubFormLoader;
