import { ActionFunction, redirect } from 'react-router-dom';

const eventAction: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const action = formData.get('action');
  const id = formData.get('id');
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

    if (!response.ok) {
      alert(
        `Something went wrong, RSVP not sent. Error: ${response.statusText}`
      );
      return null;
    }
    return redirect(`/dashboard/event/${id}`);
  }
  return null;
};

export default eventAction;
