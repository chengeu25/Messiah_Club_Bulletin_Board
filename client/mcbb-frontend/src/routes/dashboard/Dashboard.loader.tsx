import { LoaderFunction, LoaderFunctionArgs, redirect } from 'react-router-dom';

const dashboardLoader: LoaderFunction = async ({
  request
}: LoaderFunctionArgs) =>
  new URL(request.url).pathname === '/dashboard' ||
  new URL(request.url).pathname === '/dashboard/'
    ? redirect('/dashboard/home')
    : null;

export default dashboardLoader;
