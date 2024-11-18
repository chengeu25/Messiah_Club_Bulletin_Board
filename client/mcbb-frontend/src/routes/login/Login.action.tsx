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
      return redirect('/verifyEmail');
    }
    // Check if login failed because email is not verified
    else {
      const json = await loginResponse.json();
      if (json?.error === 'Email not verified') {
        return redirect('/verifyEmail');
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
