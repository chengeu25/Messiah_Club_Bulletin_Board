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
  const remember = formData.get('remember');
  console.log(remember);
  const action = formData.get('action');

  // Handle login on server
  if (action === 'login') {
    const request = await fetch('http://localhost:3000/api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify({ email, password, remember })
    });

    // Go to the dashboard if login worked
    if (request.ok) {
      return redirect('/dashboard');
    }
    // Go to the login page if login failed, with an error message
    else {
      const json = await request.json();
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
