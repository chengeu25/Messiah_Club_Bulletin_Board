import { ActionFunction } from 'react-router';

const loginAction: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const email = formData.get('email');
  const password = formData.get('password');
  const action = formData.get('action');
  console.log(email, password, action);
  return null;
};

export default loginAction;
