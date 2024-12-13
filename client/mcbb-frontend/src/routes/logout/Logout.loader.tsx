import { redirect } from 'react-router-dom';

const logoutLoader = async () => {
  await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/auth/logout`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json'
    }
  });
  return redirect('/login');
};

export default logoutLoader;
