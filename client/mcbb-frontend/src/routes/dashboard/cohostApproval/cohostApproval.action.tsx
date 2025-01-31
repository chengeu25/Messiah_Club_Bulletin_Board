import { ActionFunction, json } from 'react-router-dom';

export const cohostApprovalAction: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const eventId = formData.get('eventId');
  const clubId = formData.get('clubId'); // Ensure clubId is included
  const decision = formData.get('status'); // "approve" or "decline"

  if (!eventId || !clubId || !decision) {
    return json({ error: 'Missing required parameters.' }, { status: 400 });
  }

  try {
    const endpoint = decision === 'approve' ? 'approve-collaboration' : 'decline-collaboration';
    const response = await fetch(
      `${import.meta.env.VITE_API_BASE_URL}/api/events/${endpoint}`,
      {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ eventId, clubId }), // Include clubId in the request body
      }
    );

    if (!response.ok) {
      throw new Error('Failed to process approval request.');
    }

    const result = await response.json();
    return json({ message: result.message }, { status: 200 });
  } catch (error) {
    console.error('Error approving/declining event:', error);
    return json({ error: 'An error occurred while processing your request.' }, { status: 500 });
  }
};