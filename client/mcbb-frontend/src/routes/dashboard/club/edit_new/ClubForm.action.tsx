import { ActionFunction, redirect } from 'react-router-dom';

const clubFormAction: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const action = formData.get('action');
  if (action === 'cancel') {
    return redirect('/dashboard/clubs');
  } else if (action === 'create') {
    return redirect('/dashboard/clubs');
  } else if (action === 'update') {
    return redirect('/dashboard/clubs');
  }
};

export default clubFormAction;
