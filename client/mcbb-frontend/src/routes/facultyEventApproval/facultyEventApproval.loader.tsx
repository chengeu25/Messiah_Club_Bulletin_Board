import { json, LoaderFunction, redirect } from 'react-router';
import checkUser from '../../helper/checkUser';
import { UserType as User } from '../../types/databaseTypes';

const facultyEventApprovalloader: LoaderFunction = async ({ request }) => {
  const user = await checkUser();
  if (user === false) {
    return redirect('/login?serviceTo=' + new URL(request.url).pathname);
  }
  if (user?.emailVerified === false) {
    return redirect('/verifyEmail');
  }
  if ((user as User).isFaculty === false) {
    throw new Response('You need faculty privileges to access this page', {
      status: 403,
      statusText: 'Forbidden'
    });
  }

  const url = new URL(request.url);
  const startDate =
    url.searchParams.get('start_date') || new Date().toISOString();
  let endDate =
    url.searchParams.get('end_date') ||
    new Date(new Date().setDate(new Date().getDate() + 7)).toISOString();
  const endDateObj = new Date(endDate);
  endDateObj.setMonth(endDateObj.getMonth() + 6);
  endDate = endDateObj.toISOString();
  const schoolId = url.searchParams.get('school_id') || '';
  const userId = url.searchParams.get('user_id') || '';

  try {
    const eventsResponse = await fetch(
      `${
        import.meta.env.VITE_API_BASE_URL
      }/api/events/events?start_date=${encodeURIComponent(
        startDate
      )}&end_date=${encodeURIComponent(endDate)}&school_id=${encodeURIComponent(
        schoolId
      )}&user_id=${encodeURIComponent(userId)}&approved=false&images=false`,
      {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    if (!eventsResponse.ok) {
      throw new Error(
        `Failed to fetch unapproved events: ${eventsResponse.statusText}`
      );
    }

    const eventsContentType = eventsResponse.headers.get('content-type');
    if (!eventsContentType || !eventsContentType.includes('application/json')) {
      const text = await eventsResponse.text();
      console.error('Received non-JSON response from server:', text);
      throw new Error('Received non-JSON response from server');
    }

    const eventsData = await eventsResponse.json();

    const photosResponse = await fetch(
      `${import.meta.env.VITE_API_BASE_URL}/api/events/event-photos`,
      {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    if (!photosResponse.ok) {
      throw new Error(
        `Failed to fetch event photos: ${photosResponse.statusText}`
      );
    }

    const photosContentType = photosResponse.headers.get('content-type');
    if (!photosContentType || !photosContentType.includes('application/json')) {
      const text = await photosResponse.text();
      console.error('Received non-JSON response from server:', text);
      throw new Error('Received non-JSON response from server');
    }

    const photosData = await photosResponse.json();

    // Map photos to events
    const eventsWithPhotos = eventsData.events.map((event: { id: any }) => {
      const eventPhotos = photosData.photos.filter(
        (photo: { event_id: any }) => photo.event_id === event.id
      );
      return {
        ...event,
        photos: eventPhotos
      };
    });

    return json({ user: user, events: eventsWithPhotos }, { status: 200 });
  } catch (error) {
    console.error('Error fetching unapproved events or photos:', error);
    return json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
};

export default facultyEventApprovalloader;
