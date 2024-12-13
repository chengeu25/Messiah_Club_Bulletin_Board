import { ActionFunction, redirect } from 'react-router';
import checkUser from '../../../helper/checkUser';

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
      return redirect(
        '/dashboard/assignFaculty?message=' + 'assigned%20faculty'
      );
    } else {
      const json = await loginRequest.json();
      return redirect('/dashboard/assignFaculty?error=' + json.error);
    }
  } else {
    return redirect('/login?error' + 'Not%20logged%20in');
  }
};

export default assignFacultyAction;
