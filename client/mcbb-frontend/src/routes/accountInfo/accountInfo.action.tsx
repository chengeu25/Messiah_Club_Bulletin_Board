import { ActionFunction, redirect } from 'react-router';
import checkUser from '../../helper/checkUser';

/**
 * Handles the account info update action for authenticated users.
 *
 * @function accountInfoAction
 * @param {Object} params - Action function parameters from React Router
 * @param {Request} params.request - The form submission request
 *
 * @returns {Promise<Response>} Redirects to the account info page with success or error message
 */
const accountInfoAction: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const name = formData.get('name');
  const gender = formData.get('gender');

  const url = new URL(request.url);
  const pathname = url.pathname;

  const emailRequest = await checkUser();
  if (emailRequest) {
    const updateRequest = await fetch(
      `${import.meta.env.VITE_API_BASE_URL}/api/auth/account-info`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ name, gender, emailRequest })
      }
    );

    if (updateRequest.ok) {
      return redirect(
        '/accountInfo?message=' + 'Account%20info%20updated%20successfully'
      );
    } else {
      const json = await updateRequest.json();
      return redirect('/accountInfo?error=' + json.error);
    }
  } else {
    return redirect(
      '/login?error=' + 'Not%20logged%20in' + '&serviceTo=' + pathname
    );
  }
};

export default accountInfoAction;
