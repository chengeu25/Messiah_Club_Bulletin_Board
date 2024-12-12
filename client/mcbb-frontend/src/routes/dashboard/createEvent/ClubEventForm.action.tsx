import { ActionFunction, redirect } from 'react-router';

const clubEventFormAction: ActionFunction = async ({ request, params }) => {
  const formData = await request.formData();
  const action = formData.get('action');
  const clubName = formData.get('clubName') as string;
  const eventName = formData.get('eventName') as string;
  const description = formData.get('description') as string;
  const startDate = formData.get('startDate') as string;
  const endDate = formData.get('endDate') as string;
  const location = formData.get('location') as string;
  const eventCost = formData.get('eventCost') as string;
  const tags = formData.get('tags')
    ? JSON.parse(formData.get('tags') as string)
    : [];
  const eventPhotos = formData.getAll('eventPhotos[]');

  if (action === 'cancel') {
    return redirect('/dashboard/clubs');
  }

  try {
    const data = new FormData();
    data.append('clubName', clubName);
    data.append('eventName', eventName);
    data.append('description', description);
    data.append('startDate', startDate);
    data.append('endDate', endDate);
    data.append('location', location);
    data.append('eventCost', eventCost);
    data.append('tags', JSON.stringify(tags));
    eventPhotos.forEach((photo) => formData.append('eventPhotos[]', photo));

    const response = await fetch('http://localhost:3000/api/events/new-event', {
      method: 'POST',
      credentials: 'include',
      body: data
    });

    if (!response.ok) {
      const errorData = await response.json();
      const { clubId } = params; // Retrieve clubId from params
      return redirect(
        `/dashboard/club/${clubId}/newEvent?error=${encodeURIComponent(
          errorData.error
        )}`
      );
    }

    return redirect('/dashboard/clubs');
  } catch (error) {
    console.error('Error submitting event:', error);
    return redirect('/dashboard/club/new?error=Unexpected error occurred');
  }
};

export default clubEventFormAction;
