import { json, LoaderFunction } from 'react-router-dom';

const loginLoader: LoaderFunction = async () => {
  const resp = await fetch(
    `${import.meta.env.VITE_API_BASE_URL}/api/auth/check-user-cookie`,
    {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      }
    }
  );
  const emailJson = await resp.json();
  if (resp.ok) return json({ userId: emailJson.user_id });
  else return json({ userId: null });
};

export default loginLoader;
