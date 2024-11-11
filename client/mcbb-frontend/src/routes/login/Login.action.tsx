// Login.action.tsx
import { ActionFunction, redirect } from 'react-router';

/**
 * Handles the login action
 * @param request The request
 * @returns The action
 */
const loginAction: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const email = formData.get('email');
  const password = formData.get('password');
  const remember = formData.get('remember') === 'true' ? true : false;
  const action = formData.get('action');

  // Handle login on server
  if (action === 'login') {
    const loginResponse = await fetch('http://localhost:3000/api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify({ email, password, remember })
    });

    // Go to the dashboard if login worked
    if (loginResponse.ok) {
      return redirect('/dashboard');
    }
    // Check if login failed because email is not verified
    else {
      const json = await loginResponse.json();
      if (json?.error === 'Email not verified') {
        // Trigger resend code before redirecting to verifyEmail page
        const resendResponse = await fetch('http://localhost:3000/api/resend-code', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          credentials: 'include',
          body: JSON.stringify({ email })
        });

        // Optional: Check for errors in the resend request and handle accordingly
        if (!resendResponse.ok) {
          const resendError = await resendResponse.json();
          return redirect('/login?error=' + encodeURIComponent(resendError.error));
        }

        // Redirect to the verify email page with a success message
        return redirect('/verifyEmail?message=Verification%20code%20sent');
      }
      return redirect('/login?error=' + json.error);
    }
  }
  return action === 'signup'
    ? redirect('/signup')
    : action === 'forgot'
    ? redirect('/forgot')
    : redirect('/login');
};

export default loginAction;
