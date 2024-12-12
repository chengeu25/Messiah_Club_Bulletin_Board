import { redirect } from 'react-router-dom';

const logoutLoader = async () => {
  await fetch('http://localhost:3000/api/auth/logout', {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json'
    }
  });
  return redirect('/login');
};

export default logoutLoader;
