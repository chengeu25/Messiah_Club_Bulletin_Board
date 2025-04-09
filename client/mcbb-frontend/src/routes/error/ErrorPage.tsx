import { useMemo } from 'react';
import errorImg from '/Error.jpg';
import { Link, useRouteError, isRouteErrorResponse } from 'react-router-dom';

/**
 * ErrorPage component for handling and displaying unexpected application errors.
 *
 * @component ErrorPage
 * @description Provides a user-friendly error page with navigation options
 *
 * @returns {JSX.Element} Rendered error page with logo, error message, and homepage link
 *
 * @workflow
 * 1. Retrieve error details using React Router's useRouteError hook
 * 2. Display application logo
 * 3. Show error message
 * 4. Provide link to return to homepage
 *
 * @features
 * - Dynamic error message rendering
 * - Centralized error handling
 * - Easy navigation back to homepage
 * - Consistent branding with logo
 */
const ErrorPage = () => {
  // Retrieve error details from React Router
  const error = useRouteError();

  // Check if the error is a RouteErrorResponse (e.g., 404, 403)
  const errorDetails = useMemo(() => {
    if (isRouteErrorResponse(error)) {
      return {
        status: error.status,
        statusText: error.statusText || 'An error occurred',
        message: error.data || 'Something went wrong.'
      };
    }
    return {
      status: 500,
      statusText: 'Internal Server Error',
      message: 'An unexpected error occurred.'
    };
  }, [error]);

  return (
    <div className='h-[100dvh] w-screen flex flex-col justify-center items-center text-black'>
      <Link to='/'>
        <img
          src={errorImg}
          className='w-[400px] rounded-xl'
          alt='shark chewing on wires'
        />
      </Link>

      {/* Error status and message display */}
      <h1 className='text-3xl font-bold'>
        {errorDetails.status}: {errorDetails.statusText}
      </h1>

      <p className='text-lg mt-4'>
        {errorDetails?.status === 404
          ? "Whatever you're looking for is definitely not here."
          : errorDetails?.status === 500
          ? 'Looks like the SHARCs are chewing the wires again!'
          : errorDetails?.status === 403
          ? 'Yeah, you\'re definitely not allowed here.'
          : 'Something went wrong.'}
      </p>

      {/* Navigation and support instructions */}
      <div className='mt-6'>
        <Link to='/' className='underline'>
          Click here
        </Link>{' '}
        to go back to the homepage.
      </div>
    </div>
  );
};

export default ErrorPage;
