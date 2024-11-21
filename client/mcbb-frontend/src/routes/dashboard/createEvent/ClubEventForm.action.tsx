import { ActionFunction, redirect } from 'react-router';

const clubEventFormAction: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const eventName = formData.get('eventName');
  const eventDate = formData.get('eventDate');
  const eventDescription = formData.get('eventDescription');

  const response = await fetch('http://localhost:3000/api/club/events', {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      eventName,
      eventDate,
      eventDescription
    })
  });

  if (!response.ok) {
    return null;
  }

  return redirect('/dashboard/clubs/events');
};

export default clubEventFormAction;