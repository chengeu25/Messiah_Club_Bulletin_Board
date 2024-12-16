import { ActionFunction } from 'react-router-dom';

/**
 * Action handler for adding or removing user interests.
 * 
 * @function addInterestAction
 * @param {Object} args - Action function arguments from React Router
 * @param {Request} args.request - The form submission request
 * 
 * @returns {Promise<{message?: string, error?: string}>} 
 * Response with success message or error details
 * 
 * @description Handles interest management actions:
 * 1. Validates input data
 * 2. Determines action type (add or remove)
 * 3. Sends request to backend API
 * 4. Processes and returns server response
 * 
 * @workflow
 * 1. Extract action type and tag name from form data
 * 2. Validate input
 * 3. Select appropriate API endpoint
 * 4. Send request to server
 * 5. Return success or error message
 */
const addInterestAction: ActionFunction = async ({ request }) => {
  try {
    // Parse form data from the request
    const formData = await request.formData();
    const actionType = formData.get('action') as string; // Determines whether to add or remove
    const tagName = formData.get('tag_name') as string;

    // Validate the input
    if (!tagName) {
      return { error: 'Interest name is required' };
    }

    let endpoint = '';
    let method = '';

    // Determine the action type and set endpoint/method
    if (actionType === 'add') {
      endpoint = `${import.meta.env.VITE_API_BASE_URL}/api/interests/add-tag`;
      method = 'POST';
    } else if (actionType === 'remove') {
      endpoint = `${
        import.meta.env.VITE_API_BASE_URL
      }/api/interests/remove-tag`;
      method = 'DELETE';
    } else {
      return { error: 'Invalid action type' };
    }

    // Make the fetch request to the backend
    const response = await fetch(endpoint, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      credentials: 'include',
      mode: 'cors',
      body: JSON.stringify({ tag_name: tagName })
    });

    // Parse the response
    const result = await response.json();

    // Handle backend responses
    if (response.ok) {
      return { message: result.message };
    } else {
      return { error: result.error || 'An unexpected error occurred.' };
    }
  } catch (error) {
    console.error('Error in addInterestAction:', error);
    return { error: 'An unexpected error occurred during the request.' };
  }
};

export default addInterestAction;
