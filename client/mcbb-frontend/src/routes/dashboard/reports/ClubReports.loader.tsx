import { LoaderFunction, redirect } from 'react-router';
import checkUser from '../../../helper/checkUser';
import { UserType } from '../../../types/databaseTypes';
import REPORTS from '../../../reports';

const clubReportsLoader: LoaderFunction = async ({ request, params }) => {
  const user = await checkUser();
  const url = new URL(request.url);
  if (user === false) {
    return redirect('/login?serviceTo=' + url.pathname);
  }
  if (user?.emailVerified === false) {
    return redirect('/verifyEmail');
  }
  if (
    (user as UserType).isFaculty === false &&
    !user.clubAdmins.includes(Number(params.id))
  ) {
    return redirect('/dashboard/home');
  }
  const reports = REPORTS.SCHOOL_WIDE;
  return {
    reports
  };
};

export default clubReportsLoader;
