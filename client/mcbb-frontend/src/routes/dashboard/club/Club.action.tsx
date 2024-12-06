import { ActionFunction, json, redirect } from 'react-router';

const clubAction: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const action = formData.get('action');
  const clubId = formData.get('clubId');
  const userId = formData.get('userId'); // If user_id comes from formData

  // Redirect to new event if action is 'newEvent'
  if (action === 'newEvent') {
    if (!clubId) {
      console.error("Missing clubId for 'newEvent' action");
      return json({ error: "Missing clubId" }, { status: 400 });
    }
    return redirect(`/dashboard/club/${clubId}/newEvent`);
  }

  // Handle subscription actions
  if (action === 'subscribe' || action === 'unsubscribe') {
    console.log('Action:', action);
    console.log('Club ID:', clubId);
    console.log('User ID:', userId);

    // Validate required fields
    if (!clubId || !userId) {
      console.error("Missing required fields for subscription:", { action, clubId, userId });
      return json({ error: "Missing required fields" }, { status: 400 });
    }

    try {
      const response = await fetch(`http://localhost:3000/api/subscribe?user_id=${userId}`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action, clubId, userId }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Subscription update failed:', errorText);
        return json({ error: 'Failed to update subscription' }, { status: response.status });
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
