import { ActionFunction, redirect } from 'react-router';

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
