import { LoaderFunction } from 'react-router-dom';

const clubFormLoader: LoaderFunction = async ({ params }) => {
  const id = params.id;
  if (id) {
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
  }
  return null;
};

export default clubFormLoader;
