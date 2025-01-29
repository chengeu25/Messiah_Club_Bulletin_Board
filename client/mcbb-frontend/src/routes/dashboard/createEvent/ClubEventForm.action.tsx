import { ActionFunction, redirect } from 'react-router';

const clubEventFormAction: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const action = formData.get('action');
  const clubId = formData.get('clubId') as string;
  const eventName = formData.get('eventName') as string;
  const description = formData.get('description') as string;
  const startDate = formData.get('startDate') as string;
  const endDate = formData.get('endDate') as string;
  const location = formData.get('location') as string;
  const eventCost = formData.get('eventCost') as string;
  const tags = formData.get('tags')
    ? JSON.parse(formData.get('tags') as string)
    : [];
  const cohosts = formData.get('cohosts')
    ? JSON.parse(formData.get('cohosts') as string)
    : [];
  const eventPhotos = formData.getAll('eventPhotos');
  console.log('DEBUG: eventPhotos from formData:', eventPhotos);
  console.log('DEBUG: eventPhotos type:', typeof eventPhotos[0]);
  console.log(
    'DEBUG: eventPhotos instanceof File:',
    eventPhotos[0] instanceof File
  );
  console.log('DEBUG: eventPhotos keys:', Object.keys(eventPhotos[0] || {}));
  console.log('DEBUG: formData keys:', Array.from(formData.keys()));
  console.log('DEBUG: formData entries:', Array.from(formData.entries()));

  if (action === 'cancel') {
    return redirect(`/dashboard/club/${clubId}`);
  }

  try {
    const data = new FormData();
    data.append('clubId', clubId);
    data.append('eventName', eventName);
    data.append('description', description);
    data.append('startDate', startDate);
    data.append('endDate', endDate);
    data.append('location', location);
    data.append('eventCost', eventCost);
    data.append('tags', JSON.stringify(tags));
    data.append('coHosts', JSON.stringify(cohosts));
    eventPhotos.forEach((photo) => data.append('eventPhotos', photo));

    const response = await fetch(
      `${import.meta.env.VITE_API_BASE_URL}/api/events/new-event`,
      {
        method: 'POST',
        credentials: 'include',
        body: data
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      return redirect(
        `/dashboard/club/${clubId}/newEvent?error=${encodeURIComponent(
          errorData.error
        )}`
      );
    }

    return redirect(`/dashboard/club/${clubId}`);
  } catch (error) {
    console.error('Error submitting event:', error);
    return redirect(
      `/dashboard/club/${clubId}/newEvent?error=Unexpected error occurred`
    );
  }
};

export default clubEventFormAction;
