import {
  Outlet,
  useLoaderData,
  useNavigate,
  Link,
  useLocation
} from 'react-router-dom';
import Button from '../components/formElements/Button.component';
import Input from '../components/formElements/Input.component';
import Select from '../components/formElements/Select.component';
import { IoIosArrowBack, IoIosArrowForward } from 'react-icons/io';
import { BiHome } from 'react-icons/bi';
import {
  getMonthName,
  getMostRecentSunday,
  getNextSaturday
} from '../helper/dateUtils';

const Root = () => {
  const user = useLoaderData();
  const navigate = useNavigate();
  const location = useLocation();
  return (
    <div className='w-screen h-screen flex flex-col relative bg-gray-100'>
      <nav className='w-full bg-blue-950 text-white p-3 shadow-md relative flex justify-between items-center gap-6'>
        <span className='text-xl'>
          <Link to='/'>
            <img src='../../assets/logo.png' className='h-12' />
          </Link>
        </span>
        {location.pathname.includes('/dashboard') &&
        !location.pathname.includes('/home') ? (
          <div className='flex flex-row gap-6 flex-grow items-center justify-center'>
            <Input
              label={`Search for ${
                location.pathname.split('/')[
                  location.pathname.split('/').length - 1
                ] === 'clubs'
                  ? 'Clubs'
                  : 'Events'
              }`}
              name='search'
              type='text'
              color='blue'
              placeholder='Search'
              filled={false}
            />
            <Select
              options={[
                'All',
                'Suggested',
                location.pathname.includes('/clubs')
                  ? 'Subscribed'
                  : 'Hosted by Subscribed Clubs',
                ...(location.pathname.includes('/calendar')
                  ? ['Attending']
                  : [])
              ]}
              label='Filter'
              color='white'
              filled={false}
            />
            {location.pathname.includes('/calendar') && (
              <div className='flex flex-row gap-2 h-full justify-center items-center'>
                <Button
                  icon={<BiHome />}
                  color='white'
                  filled={false}
                  className='p-2 h-full'
                />
                <Button
                  icon={<IoIosArrowBack />}
                  color='white'
                  filled={false}
                  className='p-2 h-full'
                />
                <p className='text-nowrap'>{`${getMonthName(
                  new Date()
                )} ${getMostRecentSunday(
                  new Date()
                ).getDate()} - ${getNextSaturday(
                  new Date()
                ).getDate()}, ${new Date().getFullYear()}`}</p>
                <Button
                  icon={<IoIosArrowForward />}
                  color='white'
                  filled={false}
                  className='p-2 h-full'
                />
              </div>
            )}
          </div>
        ) : (
          <></>
        )}
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
