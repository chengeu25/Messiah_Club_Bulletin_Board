import { ActionFunction, redirect } from 'react-router';

/**
 * Action handler for clubs dashboard interactions.
 * 
 * @function clubsAction
 * @param {Object} args - Action function arguments from React Router
 * @param {Request} args.request - The form submission request
 * 
 * @returns {Promise<Response>} Redirects to appropriate club-related pages
 * 
 * @description Handles various club-related actions:
 * 1. Create a new club
 * 2. Edit an existing club
 * 3. Reactivate an inactive club
 * 4. Delete a club
 * 5. View club details
 * 
 * @workflow
 * 1. Extract action type and club ID from form data
 * 2. Redirect to the appropriate page based on the action
 */
const clubsAction: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const action = formData.get('action');
  const id = formData.get('id');
  if (action === 'create') {
    return redirect(`/dashboard/club/new`);
  } else if (action === 'edit' || action === 'reactivate') {
    return redirect(`/dashboard/club/${id}/edit`);
  } else if (action === 'delete') {
    return redirect(`/dashboard/club/${id}/delete`);
  } else if (action === 'details') {
    return redirect(`/dashboard/club/${id}`);
  }
};

export default clubsAction;
