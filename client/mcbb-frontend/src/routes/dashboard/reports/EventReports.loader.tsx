import { LoaderFunction, redirect } from 'react-router';
import checkUser from '../../../helper/checkUser';
import REPORTS from '../../../reports';
import { EventDetailType, UserType } from '../../../types/databaseTypes';

const eventReportsLoader: LoaderFunction = async ({ request, params }) => {
  const user = await checkUser();
  const url = new URL(request.url);
  if (user === false) {
    return redirect('/login?serviceTo=' + url.pathname);
  }
  if (user?.emailVerified === false) {
    return redirect('/verifyEmail');
  }
  const eventResp = await fetch(
    `${import.meta.env.VITE_API_BASE_URL}/api/events/event/${params.id}`,
    {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      }
    }
  );

  if (!eventResp.ok) {
    return redirect('/dashboard/home');
  }
  const event = (await eventResp.json()).event as EventDetailType;
  if (
    (user as UserType).isFaculty === false &&
    !user?.clubAdmins?.some((adminClubId) =>
      event.host.some((host) => host.id === adminClubId)
    )
  ) {
    return redirect('/dashboard/home');
  }
  const reports = REPORTS.EVENT;
  return {
    reports
  };
};

export default eventReportsLoader;
