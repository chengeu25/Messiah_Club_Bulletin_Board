import { Outlet, useLoaderData, useNavigate, Link } from 'react-router-dom';
import Button from '../components/formElements/Button.component';

const Root = () => {
  const user = useLoaderData();
  const navigate = useNavigate();
  return (
    <div className='w-screen h-screen flex flex-col relative'>
      <nav className='w-full bg-blue-950 text-white p-3 shadow-md relative flex justify-between items-center'>
        <span className='text-xl'>
          <Link to='/'>Messiah University Engagement Bulletin</Link>
        </span>
        <div>
          {user ? (
            <></>
          ) : (
            <Button
              text='Log In or Sign Up'
              color='white'
              filled={false}
              onClick={() => {
                navigate('/login');
              }}
            />
          )}
        </div>
      </nav>
      <div className='w-full h-full relative overflow-y-scroll'>
        <Outlet />
      </div>
    </div>
  );
};

export default Root;
