// filepath: /Users/chengeu/Desktop/SHARC/Messiah_Club_Bulletin_Board/client/mcbb-frontend/src/routes/schoolEdit/schoolEdit.action.tsx
import { json, redirect, ActionFunction } from 'react-router-dom';

/**
 * Action function to handle form submission for school data update
 * @param {Object} params - Parameters for the action function
 * @returns {Promise<Response>} JSON response with the result of the update
 */
export const schoolEditaction: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const actionType = formData.get('actionType');

  // Log the actionType to the console
  console.log('Action Type:', actionType);

  const schoolData = {
    name: formData.get('name'),
    color: (formData.get('color') as string | null)?.replace(/^#/, '') ?? '', // Remove '#' if present
    logo: formData.get('logo')
  };

  // Log the schoolData to the console
  console.log('School Data:', schoolData);

  if (actionType === 'submit') {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/school/update`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          credentials: 'include',
          body: JSON.stringify(schoolData)
        }
      );

      if (!response.ok) {
        throw new Error('Failed to update school data');
      }

      return redirect('/dashboard/faculty/schoolEdit');
    } catch (error) {
      console.error('Error updating school data:', error);
      return json(
        { error: error instanceof Error ? error.message : 'Unknown error' },
        { status: 500 }
      );
    }
  }

  // Return null if actionType is not 'submit'
  return null;
};

export default schoolEditaction;
