// verifyEmail.loader.tsx

import { LoaderFunction, LoaderFunctionArgs, redirect } from 'react-router-dom';
import checkUser from '../../helper/checkUser';

/**
 * Loader function to check if user is logged in and auto-send verification code if not verified
 */
const verifyEmailLoader: LoaderFunction = async ({ request }: LoaderFunctionArgs) => {
  const user = await checkUser();
  if (!user) {
    return redirect('/login');
  }

  // Automatically resend verification code if user is redirected here
  if (user !== true) {
    await fetch('http://localhost:3000/api/resend-code', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ email: user.email }), // Assuming checkUser returns user email
    });
  }

  // No redirection here; just return null to proceed with loading the verify email page
  return null;
};

export default verifyEmailLoader;
