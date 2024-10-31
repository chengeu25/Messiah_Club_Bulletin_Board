import { ActionFunctionArgs, redirect } from 'react-router-dom';

const signUpAction = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData();
  const email = formData.get('email');
  const password = formData.get('password');
  const gender = formData.get('gender');
  console.log(email, password, gender);
  const result = await fetch('http://localhost:3000/api/signup', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ email, password, gender })
  });
  if (result.ok) {
    return redirect('/verifyEmail');
  }
  return redirect('/login');
};

export default signUpAction;
