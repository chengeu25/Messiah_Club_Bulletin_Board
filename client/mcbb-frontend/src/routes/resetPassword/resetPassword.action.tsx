import { ActionFunction, redirect } from 'react-router';

/**
 * Action handler for initiating password reset process.
 *
 * @function resetPasswordAction
 * @param {Object} context - Action function context
 * @param {Request} context.request - The form submission request
 *
 * @returns {Promise<Response>} Redirect response after password reset request
 *
 * @description Handles the password reset workflow:
 * 1. Extract user email
 * 2. Send password reset request to backend
 * 3. Redirect to login page
 *
 * @workflow
 * 1. Extract email from form data
 * 2. Send reset link request to backend
 * 3. Redirect to login page
 *
 * @features
 * - Secure password reset initiation
 * - Reset link generation
 * - Simple user experience
 */
const resetPasswordAction: ActionFunction = async ({ request }) => {
  // Extract form data
  const formData = await request.formData();
  const email = formData.get('email');

  // Send reset link request to backend
  await fetch('http://localhost:5173/api/resetPassword', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    credentials: 'include',
    body: JSON.stringify({ email })
  });

  alert('Reset link to ' + email);
  return redirect('/login');
};

export default resetPasswordAction;
