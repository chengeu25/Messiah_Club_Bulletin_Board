import { ActionFunction, redirect } from 'react-router';

const verifyEmailAction: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const code = formData.get('code');
  const action = formData.get('action');
  const email = formData.get('email');

  if (action === 'verifyEmail') {
    const request = await fetch(
      `${import.meta.env.VITE_API_BASE_URL}/api/auth/verify-email`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ code })
      }
    );

    if (request.ok) {
      return redirect('/dashboard');
    } else {
      const json = await request.json();

      return redirect('/verifyEmail?error=' + json.error);
    }
  }

  if (action === 'resendCode') {
    const request = await fetch(
      `${import.meta.env.VITE_API_BASE_URL}/api/auth/resend-code`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ email }) //(no need to send email in the body)
      }
    );

    if (request.ok) {
      return redirect('/verifyEmail?message=Code%20resend%20succesfully');
    } else {
      const json = await request.json();

      return redirect('/verifyEmail?error=' + json.error);
    }
  }
};

export default verifyEmailAction;
