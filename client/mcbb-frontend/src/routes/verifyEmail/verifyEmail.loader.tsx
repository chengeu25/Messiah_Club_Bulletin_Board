// verifyEmail.loader.tsx

import { LoaderFunction, LoaderFunctionArgs, redirect } from 'react-router-dom';
import checkUser from '../../helper/checkUser';

/**
 * Loader function to check if user is logged in and auto-send verification code if not verified
 */
const verifyEmailLoader: LoaderFunction = async ({
  request
}: LoaderFunctionArgs) => {
  const user = await checkUser();
  if (!user) {
    return redirect('/login');
  }

  const url = new URL(request.url);
  const searchParams = new URLSearchParams(url.search);
  // Check if there are any search parameters
  if (searchParams.toString()) {
    // If there are search parameters, you can return early or handle it differently
    return null; // or return some default data
  }

  if (user !== true) {
    const resp = await fetch('http://localhost:3000/api/auth/resend-code', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify({ email: user.email }) // Assuming checkUser returns user email
    });

    const json = await resp.json();

    if (!resp.ok) {
      return redirect('/verifyEmail?error=' + json.error);
    }
  }

  // No redirection here; just return null to proceed with loading the verify email page
  return null;
};

export default verifyEmailLoader;
