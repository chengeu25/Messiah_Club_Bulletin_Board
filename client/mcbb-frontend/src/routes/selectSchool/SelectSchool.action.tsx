import { ActionFunction, redirect } from 'react-router-dom';

const selectSchoolAction: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const schoolId = formData.get('schoolId');
  const routeType = formData.get('route');

  if (!schoolId || !routeType) {
    return redirect('/selectSchool');
  }

  // Redirect to either login or signup based on the route type
  if (routeType === 'login') {
    return redirect(`/login/${schoolId}`);
  } else if (routeType === 'signup') {
    return redirect(`/signup/${schoolId}`);
  }

  return redirect('/selectSchool');
};

export default selectSchoolAction;
