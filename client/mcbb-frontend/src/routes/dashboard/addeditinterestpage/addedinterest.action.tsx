import { ActionFunction } from 'react-router-dom';

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
      endpoint = 'http://127.0.0.1:3000/api/interests/add-tag';
      method = 'POST';
    } else if (actionType === 'remove') {
      endpoint = 'http://127.0.0.1:3000/api/interests/remove-tag';
      method = 'DELETE';
    } else {
      return { error: 'Invalid action type' };
    }

    // Make the fetch request to the backend
    const response = await fetch(endpoint, {
      method,
      headers: {
        'Content-Type': 'application/json'
      },
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
  } catch (err) {
    console.error('Error in addInterestAction:', err);
    return {
      error: 'Failed to connect to the server. Please try again later.'
    };
  }
};

export default addInterestAction;
