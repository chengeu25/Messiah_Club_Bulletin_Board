import { ActionFunction, json } from 'react-router-dom';

/**
 * Action handler for updating user email preferences
 *
 * @function emailPreferencesAction
 * @param {Object} context - Action function context
 * @param {Request} context.request - The form submission request
 *
 * @returns {Promise<Object>} Action result with success message or error
 *
 * @description Handles the workflow for updating a user's email preferences:
 * 1. Extract email frequency and event type from form data
 * 2. Send update request to backend API
 * 3. Return success message or error details
 *
 * @workflow
 * 1. Parse form submission data
 * 2. Send POST request to email preferences endpoint
 * 3. Handle successful update or error scenarios
 *
 * @features
 * - Secure API communication
 * - Comprehensive error handling
 * - Detailed response for UI feedback
 */
const emailPreferencesAction: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const email_frequency = formData.get('email_frequency') as string;
  const email_event_type = formData.get('email_event_type') as string;

  try {
    const response = await fetch(
      `${import.meta.env.VITE_API_BASE_URL}/api/emails/email-preferences`,
      {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email_frequency,
          email_event_type
        })
      }
    );

    if (!response.ok) {
      return json({ error: 'Failed to update email preferences' }, 404);
    }

    return json({ message: 'Email preferences updated successfully' });
  } catch (error) {
    return json({ error: 'Failed to update email preferences' }, 500);
  }
};

export default emailPreferencesAction;
