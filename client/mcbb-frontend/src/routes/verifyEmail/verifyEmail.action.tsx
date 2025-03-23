import { ActionFunction, json, redirect } from 'react-router';

/**
 * Action handler for email verification process.
 *
 * @function verifyEmailAction
 * @param {Object} context - Action function context
 * @param {Request} context.request - The form submission request
 *
 * @returns {Promise<Response>} Redirect response based on verification result
 *
 * @description Handles two primary workflows:
 * 1. Email verification using a verification code
 * 2. Resending verification code
 *
 * @workflow
 * 1. Extract form data (action, code, email)
 * 2. Handle email verification request
 * 3. Handle code resend request
 * 4. Redirect based on request result
 *
 * @features
 * - Secure email verification
 * - Code resend functionality
 * - Detailed error handling
 * - Automatic redirection on success or failure
 */
const verifyEmailAction: ActionFunction = async ({ request }) => {
  // Parse the incoming form data
  const formData = await request.formData();

  // Manually parse the URL to get serviceTo
  const fullUrl = new URL(request.url);
  const serviceToString = fullUrl.searchParams.get('serviceTo');
  const serviceTo =
    serviceToString !== null &&
    serviceToString !== '' &&
    serviceToString !== 'null'
      ? serviceToString
      : '';

  const code = formData.get('code');
  const action = formData.get('action');
  const email = formData.get('email');

  // Handle email verification request
  if (action === 'verifyEmail') {
    const request = await fetch(
      `${import.meta.env.VITE_API_BASE_URL}/api/auth/verify-email`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ code })
      }
    );

    // Redirect based on verification result
    if (request.ok) {
      return redirect(serviceTo || '/dashboard');
    } else {
      if (request.status === 429) {
        return json(
          { error: 'Too many requests. Please try again later.' },
          { status: 429 }
        );
      }
      const jsonResp = await request.json();
      return json({ error: jsonResp.error }, { status: jsonResp.status });
    }
  }

  // Handle code resend request
  if (action === 'resendCode') {
    const request = await fetch(
      `${import.meta.env.VITE_API_BASE_URL}/api/auth/resend-code`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ email, forceResend: true }) //(no need to send email in the body)
      }
    );

    // Redirect based on code resend result
    if (request.ok) {
      return json(
        { message: 'Verification code resent successfully' },
        { status: 200 }
      );
    } else {
      const jsonResp = await request.json();

      return json({ error: jsonResp.error }, { status: jsonResp.status });
    }
  }
};

export default verifyEmailAction;
