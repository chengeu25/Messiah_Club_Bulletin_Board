import logo from '../../../assets/logo.png';
import { Link, useRouteError } from 'react-router-dom';

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
  const errorMessage = useRouteError();

  return (
    <div className='h-screen w-screen foreground-filled flex flex-col justify-center items-center text-white'>
      {/* Application logo with homepage link */}
      <Link to='/'>
        <img src={logo} className='w-[400px]' alt='logo' />
      </Link>

      {/* Error message display */}
      <h1 className='text-xl'>
        An unexpected error occurred:{' '}
        {errorMessage instanceof Error ? errorMessage.message : 'Unknown error'}
        .
      </h1>

      {/* Navigation and support instructions */}
      <p>
        Please try again or{' '}
        <Link to='/' className='underline'>
          click here
        </Link>{' '}
        to go back to the homepage.
      </p>
    </div>
  );
};

export default ErrorPage;
