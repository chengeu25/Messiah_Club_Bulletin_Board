// verifyEmail.loader.tsx

import {
  json,
  LoaderFunction,
  LoaderFunctionArgs,
  redirect
} from 'react-router-dom';
import checkUser from '../../helper/checkUser';
import { UserType } from '../../types/databaseTypes';

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
  const user = (await checkUser()) as UserType;

  if (!user) {
    // Redirect to login with serviceTo as a proper parameter
    const serviceTo = encodeURIComponent(new URL(request.url).pathname);
    return redirect(`/login?serviceTo=${serviceTo}`);
  }

  // Check if user needs verification
  if (!user?.emailVerified) {
    // Automatically resend verification code
    const resp = await fetch(
      `${import.meta.env.VITE_API_BASE_URL}/api/auth/resend-code`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ email: user.email, forceResend: false }) // Assumes checkUser returns user email
      }
    );

    // Handle response from code resend request
    const jsonResp = await resp.json();

    if (!resp.ok) {
      // Return error if code resend fails
      return json({ error: jsonResp.error }, { status: resp.status });
    }
  }

  // Proceed to verify email page
  return null;
};

export default verifyEmailLoader;
