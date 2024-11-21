import { ActionFunction, redirect } from 'react-router';

const clubAction: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const action = formData.get('action');
  console.log(action);
  if (action === 'newEvent') {
    return redirect(`/dashboard/club/${formData.get('clubId')}/newEvent`);
  } 
  return null;
};

export default clubAction;
