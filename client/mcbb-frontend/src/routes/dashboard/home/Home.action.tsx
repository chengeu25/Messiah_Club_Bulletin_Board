import { ActionFunction, redirect } from 'react-router-dom';

// NOTE: This action is ALSO used on the calendar page!

const homeAction: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const action = formData.get('action');
  const id = formData.get('id');
  if (action === 'details') return redirect(`/dashboard/event/${id}`);
  else if (action === 'rsvp') {
    const type = formData.get('type');
    const response = await fetch(
      `http://localhost:3000/api/rsvp?event_id=${id}&type=${type}`,
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
