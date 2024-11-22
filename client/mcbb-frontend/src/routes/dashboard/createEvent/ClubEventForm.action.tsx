import { ActionFunction, redirect } from 'react-router';

const clubEventFormAction: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const action = formData.get('action');
  const eventName = formData.get('eventName');
  const description = formData.get('description');
  const startDate = formData.get('startDate');
  const endDate = formData.get('endDate');
  const location = formData.get('location');
  const eventCost = formData.get('eventCost');
  const tags = JSON.parse(formData.get('tags') as string); // Parse the selected tags
  const eventPhotos = formData.getAll('eventPhotos[]'); // Assuming the file input is named 'eventPhotos[]'

    if (action === 'cancel') {
        return redirect('/dashboard/clubs');
    } else if (action === 'submit') {
    const response = await fetch('http://localhost:3000/api/club/events', {
        method: 'POST',
        credentials: 'include',
        headers: {
        'Content-Type': 'application/json',
        },
        body: JSON.stringify({
        eventName,
        description,
        startDate,
        endDate,
        location,
        eventCost,
        tags,
        eventPhotos,
    }),
  });

  if (response.ok) {
    return redirect('/dashboard/clubs');
  }
  const json = await response.json();
    console.log(json);
    return redirect('/dashboard/clubs');
//   return redirect('/dashboard/club/new?error=' + json.error);
  }
};

export default clubEventFormAction;
