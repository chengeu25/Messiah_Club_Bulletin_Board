import { json, LoaderFunction, redirect } from 'react-router-dom';
import checkUser from '../../../helper/checkUser';

/**
 * Loader function for fetching user's email preferences
 *
 * @function emailPreferencesLoader
 * @returns {Promise<Response>} JSON response with email preferences or redirect
 *
 * @description Handles the workflow for loading email preferences:
 * 1. Authenticate the current user
 * 2. Fetch email preferences from backend API
 * 3. Return preferences or default values
 *
 * @workflow
 * 1. Check user authentication
 * 2. Redirect to login if not authenticated
 * 3. Fetch email preferences
 * 4. Return preferences or fallback defaults
 *
 * @features
 * - User authentication check
 * - Secure API communication
 * - Graceful error handling
 * - Provides default preferences if fetch fails
 */
const emailPreferencesLoader: LoaderFunction = async ({ request }) => {
  const user = await checkUser();
  if (user === false) {
    return redirect('/login?serviceTo=' + new URL(request.url).pathname);
  }
  if (user?.emailVerified === false) {
    return redirect('/verifyEmail');
  }

  try {
    const response = await fetch(
      `${import.meta.env.VITE_API_BASE_URL}/api/emails/email-preferences`,
      {
        method: 'GET',
        credentials: 'include'
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch email preferences');
    }

    const emailPreferences = await response.json();

    return json(emailPreferences);
  } catch (error) {
    console.error('Failed to load email preferences:', error);
    return json({
      email_frequency: 'Weekly',
      email_event_type: 'Suggested'
    });
  }
};

export default emailPreferencesLoader;
