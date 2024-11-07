import { ActionFunctionArgs, json, redirect } from 'react-router-dom';

const signUpAction = async ({ request }: ActionFunctionArgs) => {
  try {
    // Parse the incoming form data
    const formData = await request.formData();
    const email = formData.get('email');
    const password = formData.get('password');
    const confirmPassword = formData.get('confirm-password');
    const gender = formData.get('gender');
    const captchaResponse = formData.get('captchaResponse'); // assuming you have a captcha field

    // Basic validation before making the request
    if (!email || !password || !confirmPassword || !gender) {
      return json({ error: 'All fields are required' }, { status: 400 });
    }
    if (password !== confirmPassword) {
      return json({ error: 'Passwords do not match' }, { status: 400 });
    }

    // Send data to the backend signup endpoint
    const response = await fetch('http://localhost:3000/api/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password, gender, captchaResponse })
    });

    // Check if the response is OK (HTTP 200)
    if (response.ok) {
      // Redirect on successful signup
      return redirect('/verifyEmail');
    }

    // Handle errors returned by the backend
    const result = await response.json();
    return json({ error: result.error || 'Signup failed' }, { status: 400 });

  } catch (error) {
    // Handle unexpected errors
    console.error('Signup action error:', error);
    return json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
};

export default signUpAction;
