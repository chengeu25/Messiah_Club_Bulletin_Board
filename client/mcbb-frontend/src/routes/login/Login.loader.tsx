import { json, LoaderFunction } from 'react-router-dom';

/**
 * Login loader for checking existing user authentication state.
 *
 * @function loginLoader
 * @returns {Promise<Response>} JSON response with user ID if authenticated
 *
 * @description Checks for existing user authentication cookie
 *
 * @workflow
 * 1. Send request to backend to check user authentication
 * 2. Return user ID if authenticated
 * 3. Return null if not authenticated
 *
 * @features
 * - Persistent login state detection
 * - Seamless user experience
 * - Remember me functionality autofills email
 */
const loginLoader: LoaderFunction = async () => {
  // Check for remember me
  const resp = await fetch(
    `${import.meta.env.VITE_API_BASE_URL}/api/auth/check-user-cookie`,
    {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      }
    }
  );

  // Parse response and return user ID
  const emailJson = await resp.json();
  if (resp.ok) return json({ userId: emailJson.user_id });
  else return json({ userId: null });
};

export default loginLoader;
