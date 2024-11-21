import { ActionFunction } from 'react-router';

const clubAction: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  return null;
};

export default clubAction;
