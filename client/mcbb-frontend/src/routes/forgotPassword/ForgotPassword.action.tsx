import { ActionFunction, redirect } from 'react-router';

const forgotPasswordAction: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const email = formData.get('email');
  const action = formData.get('action');
  console.log(email, action);
  alert('Temporary password sent to ' + email);
  return redirect('/login');
};

export default forgotPasswordAction;
