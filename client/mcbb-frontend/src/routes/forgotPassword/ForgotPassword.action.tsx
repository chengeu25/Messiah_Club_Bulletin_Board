import { ActionFunction, redirect } from 'react-router';

const forgotPasswordAction: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const email = formData.get('email');
  // const action = formData.get('action');

  const loginRequest = await fetch(
    'http://localhost:3000/api/auth/forgot-password',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify({ email })
    }
  );

  if (loginRequest.ok) {
    return redirect('/forgotPasswordMessage');
  } else {
    const json = await loginRequest.json();
    return redirect('/forgot?error=' + json.error);
  }
};

export default forgotPasswordAction;
