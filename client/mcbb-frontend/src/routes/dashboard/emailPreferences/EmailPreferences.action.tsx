import { ActionFunction } from 'react-router';

const emailPreferencesAction: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
};

export default emailPreferencesAction;
