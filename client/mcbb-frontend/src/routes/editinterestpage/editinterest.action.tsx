import { ActionFunction, redirect } from 'react-router-dom';

const EditInterestsAction: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const interests = formData.get('interests');

  // Ensure the interests data is parsed correctly (it's a JSON string)
  const parsedInterests = interests ? JSON.parse(interests as string) : [];

  // Prepare the data to be sent to the backend
  const data = {
    interests: parsedInterests
  };

  try {
    const response = await fetch(
      'http://localhost:3000/api/interests/edit-interests',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data),
        credentials: 'include'
      }
    );

    const result = await response.json();

    if (response.ok) {
      alert(result.message);
      return redirect('/dashboard');
    } else {
      alert(result.error || 'An error occurred while updating interests');
    }
  } catch (error) {
    console.error('Error updating interests:', error);
    alert('An error occurred while updating interests');
  }
  return null; // No redirect if an error occurs
};

export default EditInterestsAction;
