// Login.action.tsx
import { ActionFunction, redirect, json } from 'react-router';

/**
 * Login action handler for user authentication and routing.
 *
 * @function loginAction
 * @param {Object} context - Action function context
 * @param {Request} context.request - The form submission request
 *
 * @returns {Promise<Response>} Redirect response based on authentication result
 *
 * @description Handles multiple authentication-related actions:
 * 1. User login with email and password
 * 2. Routing to signup or forgot password pages
 * 3. Handling login success and failure scenarios
 *
 * @workflow
 * 1. Extract form data (email, password, remember me)
 * 2. Send login request to backend
 * 3. Handle login response
 * 4. Redirect based on authentication result
 *
 * @features
 * - Secure login with credentials
 * - Remember me functionality
 * - Email verification check
 * - Dynamic routing based on action and authentication status
 */
const loginAction: ActionFunction = async ({ request }) => {
  // Extract form data
  const formData = await request.formData();
  const url = new URL(request.url);
  const searchParams = new URLSearchParams(url.search);
  const email = formData.get('email');
  const password = formData.get('password');
  const remember = formData.get('remember') === 'true' ? true : false;
  const school = formData.get('schoolId');
  const action = formData.get('action');

  // Handle login on server
  if (action === 'login') {
    // Send login request to backend
    const loginResponse = await fetch(
      `${import.meta.env.VITE_API_BASE_URL}/api/auth/login`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ email, password, remember, school })
      }
    );

    // Handle login response
    if (loginResponse.ok) {
      // Successful login, redirect to email verification
      return redirect(
        '/verifyEmail?serviceTo=' + searchParams.get('serviceTo') || ''
      );
    } else {
      // If too many login attempts
      if (loginResponse.status === 429) {
        return json(
          { error: 'Too many login attempts. Please try again later.' },
          { status: 429 }
        );
      }
      // Check if login failed because email is not verified
      const jsonResp = await loginResponse?.json();
      if (jsonResp?.error === 'Email not verified') {
        return redirect(
          '/verifyEmail?serviceTo=' + searchParams.get('serviceTo') || ''
        );
      }
      // Return error message for other login failures
      return json(
        { error: jsonResp?.error ?? 'Unknown Error' },
        { status: 400 }
      );
    }
  }

  // Handle alternative actions (signup or forgot password)
  return action === 'signup'
    ? redirect('/selectSchool?route=signup')
    : action === 'forgot'
    ? redirect('/forgot')
    : action === 'switchSchool'
    ? redirect(
        '/selectSchool?route=login&serviceTo=' +
          searchParams.get('serviceTo') || ''
      )
    : null;
};

export default loginAction;
