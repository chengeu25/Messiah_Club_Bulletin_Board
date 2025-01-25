import { ActionFunction, json, redirect } from 'react-router';

/**
 * Action handler for club-related interactions.
 *
 * @function clubAction
 * @param {Object} context - Action function context
 * @param {Request} context.request - The form submission request
 *
 * @returns {Promise<Response>} Redirect or JSON response based on action type
 *
 * @description Handles various club and event-related actions:
 * 1. Creating new events
 * 2. Managing event RSVP
 * 3. Viewing event details
 * 4. Managing club subscriptions
 *
 * @workflow
 * 1. Extract action type and related data from form submission
 * 2. Validate required parameters
 * 3. Execute appropriate backend request
 * 4. Return response or redirect
 *
 * @throws {Error} Returns JSON error response for invalid or failed actions
 */
const clubAction: ActionFunction = async ({ request }) => {
  // Parse form data
  const formData = await request.formData();
  const action = formData.get('action');
  const clubId = formData.get('clubId');
  const userId = formData.get('userId'); // If user_id comes from formData

  // Redirect to new event creation page
  if (action === 'newEvent') {
    if (!clubId) {
      console.error("Missing clubId for 'newEvent' action");
      return json({ error: 'Missing clubId' }, { status: 400 });
    }
    return redirect(`/dashboard/club/${clubId}/newEvent`);
  }

  // Handle event RSVP actions
  if (action === 'rsvp') {
    const eventId = formData.get('id');
    if (!eventId) {
      console.error("Missing eventId for 'rsvp' action");
      return json({ error: 'Missing eventId' }, { status: 400 });
    }
    const type = formData.get('type');
    if (!type) {
      console.error("Missing type for 'rsvp' action");
      return json({ error: 'Missing type' }, { status: 400 });
    }
    const response = await fetch(
      `${
        import.meta.env.VITE_API_BASE_URL
      }/api/rsvp/rsvp?event_id=${eventId}&type=${type}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      }
    );
    if (!response.ok) {
      const errorText = await response.text();
      console.error('RSVP update failed:', errorText);
      return json(
        { error: 'Failed to update RSVP' },
        { status: response.status }
      );
    }
    return json({ success: true });
  }

  // Redirect to event details page
  if (action === 'details') {
    const eventId = formData.get('id');
    if (!eventId) {
      console.error("Missing eventId for 'details' action");
      return json({ error: 'Missing eventId' }, { status: 400 });
    }
    return redirect(`/dashboard/event/${eventId}`);
  }

  // Handle club subscription actions
  if (
    action === 'subscribe' ||
    action === 'unsubscribe' ||
    action === 'block' ||
    action === 'unblock'
  ) {
    // Validate required fields
    if (!clubId || !userId) {
      console.error('Missing required fields for subscription:', {
        action,
        clubId,
        userId
      });
      return json({ error: 'Missing required fields' }, { status: 400 });
    }

    try {
      const response = await fetch(
        `${
          import.meta.env.VITE_API_BASE_URL
        }/api/subscriptions/subscribe?user_id=${userId}`,
        {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ action, clubId, userId })
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Subscription update failed:', errorText);
        return json(
          { error: 'Failed to update subscription' },
          { status: response.status }
        );
      }

      console.log('Subscription update successful');
      return json({ success: true });
    } catch (error) {
      console.error('Unexpected error:', error);
      return json({ error: 'Unexpected error occurred' }, { status: 500 });
    }
  }

  // Fallback for unsupported actions
  console.error('Unsupported action:', action);
  return json({ error: 'Unsupported action' }, { status: 400 });
};

export default clubAction;
