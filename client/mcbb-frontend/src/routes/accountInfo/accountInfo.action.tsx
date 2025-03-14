import { ActionFunction, json, redirect } from 'react-router';
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

  const emailRequest = await checkUser();
  if (emailRequest === false) {
    return redirect('/login?serviceTo=/dashboard/accountInfo');
  }
  if (!emailRequest?.emailVerified) {
    return redirect('/login?serviceTo=/dashboard/accountInfo');
  }
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
      return json({ message: 'Account info updated successfully!' });
    } else {
      const jsonResp = await updateRequest.json();
      return json({ error: jsonResp.error }, { status: updateRequest.status });
    }
  } else {
    return redirect('/login?serviceTo=/dashboard/accountInfo');
  }
};

export default accountInfoAction;
