import { ActionFunction, json, redirect } from 'react-router';
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
  const schoolId = formData.get('schoolId');

  const emailRequest = await checkUser();
  if (emailRequest === false) {
    return redirect('/login?serviceTo=/dashboard/accountInfo');
  }
  if (!emailRequest?.emailVerified) {
    return redirect('/login?serviceTo=/dashboard/accountInfo');
  }
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

    if (loginRequest.ok) {
      return json(
        {
          redirectTo: `/login/${schoolId}`,
          message: 'Change password successful'
        },
        { status: 200 }
      );
    } else {
      if (loginRequest.status === 429) {
        return json(
          {
            redirectTo: `/changePassword`,
            error: 'Too many requests'
          },
          {
            status: 429
          }
        );
      }
      const jsonResponse = await loginRequest.json();
      return json(
        {
          redirectTo: '/changePassword',
          error: jsonResponse.error
        },
        { status: 400 }
      );
    }
  } else {
    return json(
      {
        redirectTo: `/login/${schoolId}`,
        error: 'Not logged in'
      },
      { status: 401 }
    );
  }
};

export default changePasswordAction;
