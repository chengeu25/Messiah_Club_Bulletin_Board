import { json, LoaderFunction, redirect } from 'react-router-dom';

/**
 * Account info action handler for updating user account data.
 *
 * @function accountInfoAction
 * @param {Request} request - The request object containing form data
 * @returns {Promise<any>} The response object indicating success or failure
 */
export const accountInfoAction: LoaderFunction = async ({ request }) => {
  const formData = new URLSearchParams(await request.text());

  const updatedInfo = {
    name: formData.get('name'),
    email: formData.get('email'),
  };

  try {
    const response = await fetch(
      `${import.meta.env.VITE_API_BASE_URL}/api/user/update-account-info`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(updatedInfo),
      }
    );

    if (!response.ok) {
      return json({ error: 'Failed to update account info' }, { status: 500 });
    }

    return redirect('/dashboard/home');
  } catch (error) {
    return json({ error: 'An error occurred' }, { status: 500 });
  }
};
export default accountInfoAction;

