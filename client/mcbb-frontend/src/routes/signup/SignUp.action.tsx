import { ActionFunctionArgs, json, redirect } from 'react-router-dom';

const signUpAction = async ({ request }: ActionFunctionArgs) => {
  // Parse the incoming form data
  const formData = await request.formData();
  const email = formData.get('email');
  const password = formData.get('password');
  const confirmPassword = formData.get('confirm-password');
  const gender = formData.get('gender');
  const name = formData.get('name');
  const captchaResponse = formData.get('captchaResponse'); // assuming you have a captcha field

  // Basic validation before making the request
  if (!email || !password || !confirmPassword || !gender) {
    return json({ error: 'All fields are required' }, { status: 400 });
  }
  if (password !== confirmPassword) {
    return json({ error: 'Passwords do not match' }, { status: 400 });
  }

  // Send data to the backend signup endpoint
  const response = await fetch('http://localhost:3000/api/auth/signup', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ email, password, gender, name, captchaResponse }),
    credentials: 'include'
  });

  // Check if the response is OK (HTTP 200)
  if (response.ok) {
    // Redirect on successful signup
    return redirect('/verifyEmail');
  } else {
    const json = await response.json();
    return redirect('/signup?error=' + json.error);
  }
};

export default signUpAction;
