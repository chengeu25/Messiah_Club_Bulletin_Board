import { ActionFunction, redirect } from 'react-router';

const resetPasswordAction: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const email = formData.get('email');
  const action = formData.get('action');

  await fetch('http://localhost:5173/api/resetPassword', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    credentials: 'include',
    body: JSON.stringify({ email })
  });

  // delete the next three lines once finally finished
  alert('Temporary password sent to ' + email);
  return redirect('/login');
};

export default resetPasswordAction;
