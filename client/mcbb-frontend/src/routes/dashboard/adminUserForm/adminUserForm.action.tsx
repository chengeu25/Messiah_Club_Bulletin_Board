import { ActionFunction, json, redirect } from 'react-router-dom';
import checkUser from '../../../helper/checkUser';
import { UserType as User } from '../../../types/databaseTypes';

/**
 * Action function for admin user form operations
 *
 * @function adminUserFormAction
 * @returns {Promise<Response>} JSON response or redirect
 *
 * @description Handles various user management actions:
 * - Toggling user status
 * - Updating user information
 */
const adminUserFormAction: ActionFunction = async ({ request }) => {
  // Check user authentication
  const url = new URL(request.url);
  const user = await checkUser();
  if (user === false) {
    return redirect('/login?serviceTo=' + url.pathname);
  }
  if ((user as User).isFaculty === false) {
    return redirect('/dashboard/home');
  }

  const formData = await request.formData();
  const intent = formData.get('intent')?.toString();

  try {
    switch (intent) {
      case 'toggle-user-status': {
        const email = formData.get('email')?.toString();
        const is_active = formData.get('is_active')?.toString() === 'true';
        const is_banned = formData.get('is_banned')?.toString() === 'true';

        if (!email) {
          return json({ error: 'Email is required' }, { status: 400 });
        }

        const response = await fetch(
          `${
            import.meta.env.VITE_API_BASE_URL
          }/api/admintools/toggle-user-status/${email}`,
          {
            method: 'POST',
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              is_active: is_active !== undefined ? is_active : undefined,
              is_banned: is_banned !== undefined ? is_banned : undefined
            })
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          return json(
            {
              error: errorData.error || 'Failed to update user status'
            },
            { status: response.status }
          );
        }

        const responseData = await response.json();
        return json(
          {
            message: 'User status updated successfully',
            email,
            is_active: responseData.is_active,
            is_banned: responseData.is_banned
          },
          { status: 200 }
        );
      }

      case 'update-user-name': {
        const email = formData.get('email')?.toString();
        const name = formData.get('name')?.toString();

        if (!email || !name) {
          return json(
            { error: 'Email and name are required' },
            { status: 400 }
          );
        }

        const response = await fetch(
          `${
            import.meta.env.VITE_API_BASE_URL
          }/api/admintools/update-user/${email}`,
          {
            method: 'POST',
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name })
          }
        );

        const result = await response.json();

        if (!response.ok) {
          return json({ error: result.error }, { status: response.status });
        }

        return json({ message: 'User name updated successfully' });
      }

      case 'update-user': {
        const email = formData.get('email')?.toString();
        const name = formData.get('name')?.toString();
        const newEmail = formData.get('new_email')?.toString();

        if (!email) {
          return json({ error: 'Email is required' }, { status: 400 });
        }

        const response = await fetch(
          `${
            import.meta.env.VITE_API_BASE_URL
          }/api/admintools/update-user/${email}`,
          {
            method: 'POST',
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              name,
              new_email: newEmail
            })
          }
        );

        if (!response.ok) {
          const errorData = await response.json();
          return json(
            {
              error: errorData.message || 'Failed to update user'
            },
            { status: response.status }
          );
        }

        return json(
          {
            message: 'User updated successfully',
            email,
            name,
            new_email: newEmail
          },
          { status: 200 }
        );
      }

      default:
        return json({ error: 'Invalid intent' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error in admin user form action:', error);
    return json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
};

export default adminUserFormAction;
