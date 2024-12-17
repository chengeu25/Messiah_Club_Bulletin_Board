import { LoaderFunction } from 'react-router';

const signUpLoader: LoaderFunction = async () => {
  const schoolResp = await fetch(
    `${import.meta.env.VITE_API_BASE_URL}/api/school/all`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include'
    }
  );

  if (!schoolResp.ok) {
    throw new Error('Failed to fetch schools');
  }

  const schoolJson = await schoolResp.json();
  return { schools: schoolJson };
};

export default signUpLoader;
