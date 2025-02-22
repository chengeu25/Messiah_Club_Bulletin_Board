import { ActionFunction, json, redirect } from 'react-router';
import checkUser from '../../../helper/checkUser';

/**
 * Action handler for faculty assignment interactions.
 *
 * @function assignFacultyAction
 * @param {Object} args - Action function arguments from React Router
 * @param {Request} args.request - The form submission request
 *
 * @returns {Promise<Response>} Redirects to assign faculty page with success or error message
 *
 * @description Handles faculty assignment process:
 * 1. Validates user authentication
 * 2. Sends faculty assignment request to backend
 * 3. Redirects with appropriate message
 *
 * @workflow
 * 1. Extract form data (email, delete permissions)
 * 2. Check user authentication
 * 3. Send assignment request to server
 * 4. Redirect with success or error message
 */
const assignFacultyAction: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const email = formData.get('userEmail');
  const canDelete = formData.get('cdf') ? true : false;
  const action = formData.get('action');

  const emailRequest = await checkUser();
  if (emailRequest) {
    const loginRequest = await fetch(
      `${import.meta.env.VITE_API_BASE_URL}/api/admintools/assign-faculty`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ email, canDelete, action })
      }
    );

    if (loginRequest.ok) {
      return json({ message: 'Faculty assigned successfully!' });
    } else {
      const jsonResp = await loginRequest.json();
      return json({ error: jsonResp.error }, { status: loginRequest.status });
    }
  } else {
    return redirect('/login');
  }
};

export default assignFacultyAction;
