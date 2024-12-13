import { ActionFunction, redirect } from 'react-router';

const forgotPasswordAction: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const email = formData.get('email');
  // const action = formData.get('action');

  const loginRequest = await fetch(
    `${import.meta.env.VITE_API_BASE_URL}/api/auth/forgot-password`,
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
