import { ActionFunction, json } from 'react-router';

/**
 * Action handler for processing password reset token and resetting password.
 *
 * @function ForgotPasswordTokenAction
 * @param {Object} context - Action function context
 * @param {Request} context.request - The form submission request
 *
 * @returns {Promise<Response>} Redirect response based on password reset result
 *
 * @description Handles the password reset workflow:
 * 1. Validate password reset token
 * 2. Send password reset request to backend
 * 3. Handle successful or failed password reset
 *
 * @workflow
 * 1. Extract token and new password from form data
 * 2. Validate token presence
 * 3. Send password reset request to backend
 * 4. Redirect based on reset result
 *
 * @features
 * - Secure token-based password reset
 * - Comprehensive error handling
 * - Detailed error message parsing
 * - Graceful error and success redirects
 */
const ForgotPasswordTokenAction: ActionFunction = async ({ request }) => {
  try {
    // Extract form data
    const formData = await request.formData();
    const newPassword = formData.get('newPassword');
    const token = formData.get('token');
    const schoolId = formData.get('schoolId');

    // Validate token presence
    if (!token) {
      console.error('Token is missing from the parameters.');
      return json({ error: 'Token is missing from the parameters.' }, 400);
    }

    // Send password reset request to backend
    const loginRequest = await fetch(
      `${import.meta.env.VITE_API_BASE_URL}/api/auth/forgot-password-token`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ token, newPassword })
      }
    );

    // Handle password reset response
    if (loginRequest.ok) {
      // Successful password reset
      return json({
        message: 'Password reset successfully',
        redirectTo: `/login/${schoolId}`
      });
    } else {
      // Handle error response
      let errorMessage = 'an error has occured';
      if (
        loginRequest.headers.get('content-type')?.includes('application/json')
      ) {
        try {
          // Parse error message from JSON response
          const json = await loginRequest.json();
          errorMessage = json.error || errorMessage;
        } catch (e) {
          console.error('Failed to parse error response as JSON:', e);
        }
      } else {
        console.warn('Non-JSON error response received');
      }

      // Redirect with error message
      return json({ error: errorMessage }, 400);
    }
  } catch (error) {
    // Handle unexpected errors
    console.error('An unexpected error occurred:', error);
  }
};

export default ForgotPasswordTokenAction;
