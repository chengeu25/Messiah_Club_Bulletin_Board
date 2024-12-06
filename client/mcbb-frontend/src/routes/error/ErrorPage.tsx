import logo from '../../../assets/logo.png';
import { Link, useRouteError } from 'react-router-dom';

const ErrorPage = () => {
  const errorMessage = useRouteError();

  return (
    <div className='h-screen w-screen bg-blue-950 flex flex-col justify-center items-center text-white'>
      <Link to='/'>
        <img src={logo} className='w-[400px]' alt='logo' />
      </Link>
      <h1 className='text-xl'>
        An unexpected error occurred:{' '}
        {errorMessage instanceof Error ? errorMessage.message : 'Unknown error'}
        .
      </h1>
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
