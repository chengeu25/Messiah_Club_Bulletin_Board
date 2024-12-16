import { ActionFunction, redirect } from 'react-router';
import checkUser from '../../helper/checkUser';

/**
 * Handles the password change action for authenticated users.
 * 
 * @function changePasswordAction
 * @param {Object} params - Action function parameters from React Router
 * @param {Request} params.request - The form submission request
 * 
 * @returns {Promise<Response>} Redirects to login page with success or error message
 * 
 * @description Processes a password change request by:
 * 1. Extracting old and new passwords from form data
 * 2. Verifying user authentication
 * 3. Sending a password reset request to the backend
 * 4. Redirecting to login with appropriate message based on request outcome
 * 
 * @throws {Error} Redirects to login with an error message if authentication fails
 */
const changePasswordAction: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const oldPassword = formData.get('pwd');
  const newPassword = formData.get('npwd');

  const emailRequest = await checkUser();
  if (emailRequest) {
    const loginRequest = await fetch(
      `${import.meta.env.VITE_API_BASE_URL}/api/auth/password-reset`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ oldPassword, newPassword, emailRequest })
      }
    );

    // Go to login if password has been changed and change error message to say password has been reset
    if (loginRequest.ok) {
      return redirect('/login?message=' + 'Change%20password%20successful');
    } else {
      const json = await loginRequest.json();
      return redirect('/changePassword?error=' + json.error);
    }
  } else {
    return redirect('/login?error=' + 'Not%20logged%20in');
  }
};

export default changePasswordAction;
