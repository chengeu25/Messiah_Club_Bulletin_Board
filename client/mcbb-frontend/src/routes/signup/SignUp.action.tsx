import { ActionFunctionArgs, json, redirect } from 'react-router-dom';

/**
 * Action handler for user signup process.
 * 
 * @function signUpAction
 * @param {ActionFunctionArgs} context - Action function context
 * @param {Request} context.request - The form submission request
 * 
 * @returns {Promise<Response>} Redirect or JSON response based on signup result
 * 
 * @description Handles the user registration workflow:
 * 1. Parse and validate signup form data
 * 2. Send registration request to backend
 * 3. Handle successful or failed registration
 * 
 * @workflow
 * 1. Extract signup form data
 * 2. Perform client-side validation
 * 3. Send registration request to backend
 * 4. Redirect based on registration result
 * 
 * @features
 * - Client-side form data validation
 * - Secure user registration
 * - CAPTCHA verification
 * - Detailed error handling
 * - Automatic redirection on success
 */
const signUpAction = async ({ request }: ActionFunctionArgs) => {
  // Parse the incoming form data
  const formData = await request.formData();
  const email = formData.get('email');
  const password = formData.get('password');
  const confirmPassword = formData.get('confirm-password');
  const gender = formData.get('gender');
  const name = formData.get('name');
  const captchaResponse = formData.get('captchaResponse');

  // Basic validation before making the request
  if (!email || !password || !confirmPassword || !gender) {
    return json({ error: 'All fields are required' }, { status: 400 });
  }
  if (password !== confirmPassword) {
    return json({ error: 'Passwords do not match' }, { status: 400 });
  }

  // Send data to the backend signup endpoint
  const response = await fetch(
    `${import.meta.env.VITE_API_BASE_URL}/api/auth/signup`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password, gender, name, captchaResponse }),
      credentials: 'include'
    }
  );

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
