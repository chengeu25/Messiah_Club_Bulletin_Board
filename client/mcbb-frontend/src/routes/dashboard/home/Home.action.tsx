import { ActionFunction, redirect } from 'react-router-dom';

// NOTE: This action is ALSO used on the calendar page!

/**
 * Action handler for home dashboard events.
 * 
 * @function homeAction
 * @param {Object} args - Action function arguments from React Router
 * @param {Request} args.request - The form submission request
 * 
 * @returns {Promise<Response | null>} Redirects to event details or handles RSVP
 * 
 * @description Handles two primary actions for events:
 * 1. View event details (redirects to event page)
 * 2. RSVP to an event
 * 
 * @note This action is also used on the calendar page
 * 
 * @workflow
 * 1. Extract action type and event ID from form data
 * 2. If action is 'details', redirect to event page
 * 3. If action is 'rsvp', send RSVP request to backend
 * 4. Show alert on RSVP request failure
 */
const homeAction: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const action = formData.get('action');
  const id = formData.get('id');
  if (action === 'details') return redirect(`/dashboard/event/${id}`);
  else if (action === 'rsvp') {
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

    if (!response.ok) {
      alert(
        `Something went wrong, RSVP not sent. Error: ${response.statusText}`
      );
      return null;
    }
    return null;
  }
  return null;
};

export default homeAction;
