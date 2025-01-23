import { ActionFunction, redirect } from 'react-router-dom';

/**
 * Action handler for event-related interactions.
 * 
 * @function eventAction
 * @param {Object} context - Action function context
 * @param {Request} context.request - The form submission request
 * 
 * @returns {Promise<Response | null>} Redirect response or null
 * 
 * @description Handles event-related actions:
 * 1. RSVP (Respond to event invitation)
 * 
 * @workflow
 * 1. Extract action type and event ID from form data
 * 2. If action is RSVP:
 *    - Send RSVP request to backend
 *    - Handle response and potential errors
 *    - Redirect to event details page
 * 
 * @throws {Error} Displays an alert if RSVP request fails
 */
const eventAction: ActionFunction = async ({ request }) => {
  // Parse form data
  const formData = await request.formData();
  const action = formData.get('action');
  const id = formData.get('id');

  // Handle RSVP action
  if (action === 'rsvp') {
    const type = formData.get('type');
    const response = await fetch(
      `${import.meta.env.VITE_API_BASE_URL}/api/rsvp/rsvp?event_id=${id}&type=${type}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      }
    );

    // Handle RSVP response
    if (!response.ok) {
      alert(
        `Something went wrong, RSVP not sent. Error: ${response.statusText}`
      );
      return null;
    }
    return redirect(`/dashboard/event/${id}`);
  }

  // Handle cancel action
  if (action === 'cancel') {
    const response = await fetch(
      `${import.meta.env.VITE_API_BASE_URL}/api/events/event/${id}/cancel`,
      {
        method: 'DELETE',
        credentials: 'include',
      }
    );
    
  
    if (!response.ok) {
      alert(`Failed to cancel the event: ${response.statusText}`);
      return null;
    }
  
    return redirect('/dashboard/clubs');
  }
  
  return null;
};

export default eventAction;
