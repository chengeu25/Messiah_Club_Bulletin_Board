import { ActionFunction, redirect } from 'react-router';

/**
 * Action handler for the Forgot Password process.
 * 
 * @function forgotPasswordAction
 * @param {Object} context - Action function context
 * @param {Request} context.request - The form submission request
 * 
 * @returns {Promise<Response>} Redirect response based on password reset request
 * 
 * @description Handles the forgot password workflow:
 * 1. Extracts email from form data
 * 2. Sends password reset request to backend
 * 3. Handles response and redirects accordingly
 * 
 * @workflow
 * 1. Extract email from form submission
 * 2. Send password reset request to backend
 * 3. Redirect to success or error page based on response
 * 
 * @throws {Error} Redirects to forgot password page with error message if request fails
 */
const forgotPasswordAction: ActionFunction = async ({ request }) => {
  // Parse form data
  const formData = await request.formData();
  const email = formData.get('email');
  // const action = formData.get('action');

  // Send password reset request to backend
  const loginRequest = await fetch(
    `${import.meta.env.VITE_API_BASE_URL}/api/auth/forgot-password`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify({ email })
    }
  );

  // Handle password reset response
  if (loginRequest.ok) {
    return redirect('/forgotPasswordMessage');
  } else {
    const json = await loginRequest.json();
    return redirect('/forgot?error=' + json.error);
  }
};

export default forgotPasswordAction;
