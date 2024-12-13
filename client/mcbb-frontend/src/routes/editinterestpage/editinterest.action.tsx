import { ActionFunction, redirect } from 'react-router-dom';

/**
 * Action handler for editing user interests.
 * 
 * @function EditInterestsAction
 * @param {Object} context - Action function context
 * @param {Request} context.request - The form submission request
 * 
 * @returns {Promise<Response | null>} Redirect response or null
 * 
 * @description Handles the process of updating user interests:
 * 1. Parses interests from form data
 * 2. Sends updated interests to backend
 * 3. Handles response and potential errors
 * 
 * @workflow
 * 1. Extract interests from form submission
 * 2. Prepare data for backend request
 * 3. Send POST request to update interests
 * 4. Handle successful update or error scenarios
 * 
 * @throws {Error} Displays an alert if interests update fails
 */
const EditInterestsAction: ActionFunction = async ({ request }) => {
  // Parse form data
  const formData = await request.formData();
  const interests = formData.get('interests');

  // Ensure the interests data is parsed correctly (it's a JSON string)
  const parsedInterests = interests ? JSON.parse(interests as string) : [];

  // Prepare the data to be sent to the backend
  const data = {
    interests: parsedInterests
  };

  try {
    // Send update request to backend
    const response = await fetch(
      `${import.meta.env.VITE_API_BASE_URL}/api/interests/edit-interests`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data),
        credentials: 'include'
      }
    );

    // Parse backend response
    const result = await response.json();

    // Handle response
    if (response.ok) {
      alert(result.message);
      return redirect('/dashboard');
    } else {
      alert(result.error || 'An error occurred while updating interests');
    }
  } catch (error) {
    // Handle network or parsing errors
    console.error('Error updating interests:', error);
    alert('An error occurred while updating interests');
  }
  return null; // No redirect if an error occurs
};

export default EditInterestsAction;
