import { LoaderFunction, LoaderFunctionArgs, redirect } from 'react-router-dom';
import checkUser from '../../helper/checkUser';
import { UserType } from '../../types/databaseTypes';

/**
 * Loader function for the dashboard route.
 *
 * @function dashboardLoader
 * @param {LoaderFunctionArgs} args - Loader function arguments from React Router
 * @param {Request} args.request - The current request object
 *
 * @returns {Response | null} Redirects to home dashboard if at root dashboard path, otherwise returns null
 *
 * @description Handles routing logic for the dashboard:
 * - Redirects to '/dashboard/home' when accessing '/dashboard' or '/dashboard/'
 * - Allows other dashboard subroutes to proceed normally
 */
const dashboardLoader: LoaderFunction = async ({
  request
}: LoaderFunctionArgs) =>
  (await checkUser()) === false
    ? redirect('/login')
    : new URL(request.url).pathname === '/dashboard' ||
      new URL(request.url).pathname === '/dashboard/'
    ? redirect('/dashboard/home')
    : null;

export default dashboardLoader;
