import { ActionFunctionArgs, redirect } from 'react-router-dom';

const signUpAction = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData();
  const email = formData.get('email');
  const password = formData.get('password');
  const gender = formData.get('gender');
  console.log(email, password, gender);
  return redirect('/login');
};

export default signUpAction;
