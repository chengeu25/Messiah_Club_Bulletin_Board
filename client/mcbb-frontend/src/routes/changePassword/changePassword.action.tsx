import { ActionFunction, redirect } from 'react-router';

const changePasswordAction: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const oldPassword = formData.get('pwd');
  const newPassword = formData.get('npwd');
  const action = formData.get('action');
  console.log(oldPassword, newPassword, action);
  alert('Password changed');
  return redirect('/login');
};

export default changePasswordAction;
