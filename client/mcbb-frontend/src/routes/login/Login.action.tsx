import { ActionFunction, redirect } from 'react-router';

const loginAction: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const email = formData.get('email');
  const password = formData.get('password');
  const action = formData.get('action');
  console.log(email, password, action);
  return action === 'signup'
    ? redirect('/verifyEmail')
    : action === 'forgot'
    ? redirect('/forgot')
    : redirect('/dashboard');
};

export default loginAction;
