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
 * 3. If action is cancel:
 *    - Send cancel request to backend
 *    - Handle response and potential errors
 *    - Redirect to event details page
 * 4. If action is reports:
 *    - Redirect to event reports page
 *
 * @throws {Error} Displays an alert if RSVP request fails
 */
const eventAction: ActionFunction = async ({ request }) => {
  // Parse form data
  const formData = await request.formData();
  const action = formData.get('action');
  const id = formData.get('id');
  const comment = formData.get('comment');
  const commentId = formData.get('commentId');
  const parentId = formData.get('parentId');
  const eventId = formData.get('eventId');
  const indentLevel = formData.get('indentLevel');

  // Handle RSVP action
  if (action === 'rsvp') {
    const type = formData.get('type');
    const response = await fetch(
      `${
        import.meta.env.VITE_API_BASE_URL
      }/api/rsvp/rsvp?event_id=${id}&type=${type}`,
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
      return redirect(`/dashboard/event/${id}`);
    }
    return redirect(`/dashboard/event/${id}`);
  }

  if (action === 'comment') {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/events/post-comment`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          credentials: 'include',
          body: JSON.stringify({
            event_id: id,
            comment: comment,
            comment_id: commentId
          })
        }
      );
      if (!response.ok) {
        alert(
          `Something went wrong, comment not sent. Error: ${response.statusText}`
        );
        return null;
      }
    } catch (error) {
      console.error(error);
      return redirect(`/dashboard/event/${id}`);
    }
    return redirect(`/dashboard/event/${id}`);
  }

  if (action === 'subComment') {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/events/post-sub-comment`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          credentials: 'include',
          body: JSON.stringify({
            event_id: eventId,
            comment: comment,
            parent_id: parentId,
            indent_level: indentLevel
          })
        }
      );
      if (!response.ok) {
        alert(
          `Something went wrong, comment not sent. Error: ${response.statusText}`
        );
        return null;
      }
    } catch (error) {
      console.error(error);
      return redirect(`/dashboard/event/${eventId}`);
    }
    return redirect(`/dashboard/event/${eventId}`);
  }

  // Handle cancel action
  if (action === 'cancel') {
    const response = await fetch(
      `${import.meta.env.VITE_API_BASE_URL}/api/events/event/${id}/cancel`,
      {
        method: 'DELETE',
        credentials: 'include'
      }
    );

    if (!response.ok) {
      alert(`Failed to cancel the event: ${response.statusText}`);
      return null;
    }

    return redirect('/dashboard/home');
  }

  // Handle reports action
  if (action === 'reports') {
    return redirect(`/dashboard/event/${id}/reports`);
  }

  return null;
};

export default eventAction;
