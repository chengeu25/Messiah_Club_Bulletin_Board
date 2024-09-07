import { Navigate, useLoaderData } from 'react-router-dom';

const NavigateToLogin = () => {
  const user = useLoaderData(); // Get the user data from the loader
  return user ? (
    <Navigate to='/dashboard' replace />
  ) : (
    <Navigate to='/login' replace />
  );
};

export default NavigateToLogin;
