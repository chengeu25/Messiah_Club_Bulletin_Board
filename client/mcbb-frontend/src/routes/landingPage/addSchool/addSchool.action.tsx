import { ActionFunction, redirect, json } from 'react-router-dom';

// React Router action function
export const addSchoolsAction: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  console.log('Action called');

  // Ensure required fields are present
  const schoolName = formData.get('schoolName') as string;
  const schoolColor = formData.get('schoolColor') as string;
  const emailDomain = formData.get('emailDomain') as string;
  const schoolLogo = formData.get('schoolLogo') as File | null;

  if (!schoolName || !emailDomain) {
    return json(
      { error: 'School name and email domain are required.' },
      { status: 400 }
    );
  }

  // Prepare the request payload
  const apiFormData = new FormData();
  apiFormData.append('schoolName', schoolName);
  apiFormData.append('schoolColor', schoolColor);
  apiFormData.append('emailDomain', emailDomain);
  if (schoolLogo) {
    apiFormData.append('schoolLogo', schoolLogo);
  }

  try {
    const response = await fetch(
      `${import.meta.env.VITE_API_BASE_URL}/school/add-school`, // Ensure this endpoint is correct
      {
        method: 'POST',
        body: apiFormData,
        credentials: 'include'
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      return json(
        { error: errorData.error || 'Failed to add school' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return redirect(`/schools/${data.school_id}`); // Redirect to the new school's page
  } catch (error) {
    console.error('Error adding school:', error);
    return json(
      { error: 'An unknown error occurred while adding the school' },
      { status: 500 }
    );
  }
};

export default addSchoolsAction;
