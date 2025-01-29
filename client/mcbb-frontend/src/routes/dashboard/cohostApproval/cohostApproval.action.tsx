import { ActionFunction, redirect } from 'react-router-dom';

export const cohostApprovalAction: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const eventId = formData.get('eventId');
  const decision = formData.get('decision'); // "approve" or "decline"

  if (!eventId || !decision) {
    return { error: 'Missing required parameters.' };
  }

  try {
    const response = await fetch(
      `${import.meta.env.VITE_API_BASE_URL}/api/events/${eventId}/cohost-approval`,
      {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ decision }),
      }
    );

    if (!response.ok) {
      throw new Error('Failed to process approval request.');
    }

    return redirect('/dashboard'); // Redirect to dashboard or relevant page
  } catch (error) {
    console.error('Error approving/declining event:', error);
    return { error: 'An error occurred while processing your request.' };
  }
};
