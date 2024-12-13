// verifyEmail.loader.tsx

import { LoaderFunction, LoaderFunctionArgs, redirect } from 'react-router-dom';
import checkUser from '../../helper/checkUser';

/**
 * Loader function for email verification page.
 * 
 * @function verifyEmailLoader
 * @param {LoaderFunctionArgs} context - Loader function context
 * @param {Request} context.request - The current request
 * 
 * @returns {Promise<Response | null>} Redirect response or null
 * 
 * @description Handles pre-loading checks for email verification:
 * 1. Verify user is logged in
 * 2. Automatically resend verification code if not verified
 * 3. Handle potential error scenarios
 * 
 * @workflow
 * 1. Check if user is authenticated
 * 2. Redirect to login if not authenticated
 * 3. Check user verification status
 * 4. Automatically resend verification code if needed
 * 5. Handle any errors during code resend
 * 
 * @features
 * - User authentication check
 * - Automatic verification code resend
 * - Secure routing protection
 * - Error handling for verification process
 */
const verifyEmailLoader: LoaderFunction = async ({
  request
}: LoaderFunctionArgs) => {
  // Check user authentication status
  const user = await checkUser();
  if (!user) {
    // Redirect to login if not authenticated
    return redirect('/login');
  }

  // Parse URL search parameters
  const url = new URL(request.url);
  const searchParams = new URLSearchParams(url.search);
  
  // Handle existing search parameters
  if (searchParams.toString()) {
    // If search parameters exist, return early
    return null;
  }

  // Check if user needs verification
  if (user !== true) {
    // Automatically resend verification code
    const resp = await fetch(
      `${import.meta.env.VITE_API_BASE_URL}/api/auth/resend-code`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ email: user.email }) // Assumes checkUser returns user email
      }
    );

    // Handle response from code resend request
    const json = await resp.json();

    if (!resp.ok) {
      // Redirect with error if code resend fails
      return redirect('/verifyEmail?error=' + json.error);
    }
  }

  // Proceed to verify email page
  return null;
};

export default verifyEmailLoader;
