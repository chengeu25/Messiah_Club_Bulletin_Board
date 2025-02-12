import { json, redirect, ActionFunction } from 'react-router-dom';

/**
 * Action function to handle form submission for school data update
 * @param {Object} params - Parameters for the action function
 * @returns {Promise<Response>} JSON response with the result of the update
 */
export const schoolEditaction: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const schoolData = {
    name: formData.get('name'),
    address: formData.get('address'),
    contactEmail: formData.get('contactEmail')
  };

  try {
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/school`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(schoolData)
    });

    if (!response.ok) {
      throw new Error('Failed to update school data');
    }

    return redirect('/dashboard/schoolEdit');
  } catch (error) {
    console.error('Error updating school data:', error);
    return json({ error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
};

