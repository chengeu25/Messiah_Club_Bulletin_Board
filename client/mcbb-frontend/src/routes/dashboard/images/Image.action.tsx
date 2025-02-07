import { ActionFunction, redirect } from 'react-router-dom';

const imageAction: ActionFunction = ({ request }) => {
  const url = new URL(request.url);
  const pathParts = url.pathname.split('/').filter((part) => part !== '');
  pathParts.pop(); // Remove the last part (25)
  pathParts.pop(); // Remove the second-to-last part (images)
  const modifiedPath = '/' + pathParts.join('/');
  return redirect(modifiedPath);
};

export default imageAction;
