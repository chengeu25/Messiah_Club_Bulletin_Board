import { LoaderFunction, redirect } from 'react-router-dom';
import checkUser from '../../../../helper/checkUser';
import { UserType as User } from '../../../../types/databaseTypes';

const clubFormLoader: LoaderFunction = async ({ params }) => {
  const user = await checkUser();
  if (user === false) {
    return redirect('/login');
  }
  if ((user as User).emailVerified === false) {
    return redirect('/verifyEmail');
  }
  const tagsResponse = await fetch(
    'http://localhost:3000/api/getAvailableTags',
    {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      }
    }
  );
  if (!tagsResponse.ok) {
    throw new Error('Failed to fetch tags');
  }
  const tagsJson = await tagsResponse.json();
  const tagsAvailable = tagsJson.tags.map(
    (tag: { tag: string; tag_id: number }) => ({
      value: tag.tag_id,
      label: tag.tag
    })
  );
  const id = params.id;
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
    return { user, club, tagsAvailable };
  } else if (!(user as User).isFaculty) {
    return redirect('/dashboard/clubs');
  } else return { tagsAvailable };
};

export default clubFormLoader;
