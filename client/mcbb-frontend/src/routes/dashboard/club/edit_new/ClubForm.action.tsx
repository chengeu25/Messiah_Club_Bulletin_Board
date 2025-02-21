import { ActionFunction, json, redirect } from 'react-router-dom';

/**
 * Action handler for club creation, update, and management.
 *
 * @function clubFormAction
 * @param {Object} context - Action function context
 * @param {Request} context.request - The form submission request
 *
 * @returns {Promise<Response>} Redirect response based on action type
 *
 * @description Handles various club-related actions:
 * 1. Canceling club form
 * 2. Creating a new club
 * 3. Updating an existing club
 * 4. Deleting a club
 *
 * @workflow
 * 1. Extract action type from form data
 * 2. Perform appropriate backend request
 * 3. Redirect to clubs dashboard or handle errors
 *
 * @throws {Error} Redirects with error message if backend request fails
 */
const clubFormAction: ActionFunction = async ({ request }) => {
  // Parse form data
  const formData = await request.formData();
  const action = formData.get('action');

  // Handle cancel action
  if (action === 'cancel') {
    return redirect('/dashboard/clubs');
  }

  // Handle club creation
  else if (action === 'create') {
    const resp = await fetch(
      `${import.meta.env.VITE_API_BASE_URL}/api/clubs/new-club`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          name: formData.get('name'),
          description: formData.get('description'),
          admins: JSON.parse(formData.get('admins') as string),
          images: JSON.parse(formData.get('images') as string),
          image: formData.get('logo'),
          tags: JSON.parse(formData.get('tags') as string)
        })
      }
    );

    // Handle creation response
    if (resp.ok) {
      return redirect('/dashboard/clubs');
    }
    const jsonResp = await resp.json();
    return json(jsonResp, { status: resp.status });
  }

  // Handle delete action
  else if (action === 'delete') {
    return redirect('/dashboard/clubs', {});
  }

  // Handle club update
  else if (action === 'update') {
    const resp = await fetch(
      `${import.meta.env.VITE_API_BASE_URL}/api/clubs/update-club`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          id: formData.get('id'),
          name: formData.get('name'),
          description: formData.get('description'),
          admins: JSON.parse(formData.get('admins') as string),
          images: JSON.parse(formData.get('images') as string),
          image: formData.get('logo'),
          tags: JSON.parse(formData.get('tags') as string)
        })
      }
    );

    // Handle update response
    if (resp.ok) {
      return redirect('/dashboard/clubs');
    }
    const jsonResp = await resp.json();
    return json(jsonResp, { status: resp.status });
  }
};

export default clubFormAction;
