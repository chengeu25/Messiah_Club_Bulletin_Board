import { ActionFunction, redirect } from 'react-router';

const verifyEmailAction: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const code = formData.get('code');
  const action = formData.get('action');
  console.log(code, action);
  return action === 'verifyEmail' ? redirect('/dashboard') : null;
};

export default verifyEmailAction;
