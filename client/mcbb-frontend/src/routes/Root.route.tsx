/**
 * The main route component for the application. This component
 * renders the top navigation bar and the main content of the page.
 */
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
import { useMemo } from 'react';
import toTitleCase from '../helper/titleCase';
import UserDropdown from '../components/userDropdown/UserDropdown.component';
import { User } from '../helper/checkUser';

const Root = () => {
  const user = useLoaderData();
  const navigate = useNavigate();
  const location = useLocation();

  /**
   * Returns the current page name based on the location pathname.
   * @returns {string} The current page name.
   */
  const currentPage = useMemo(
    () =>
      toTitleCase(
        location.pathname.split('/')[location.pathname.split('/').length - 1]
      )
        .replace('Home', 'Events')
        .replace('Calendar', 'Events'),
    [location.pathname]
  );

  return (
    <div className='w-screen h-screen flex flex-col relative bg-gray-100'>
      <nav className='w-full h-20 sm:min-h-[10%] bg-blue-950 text-white p-3 shadow-md relative flex justify-between items-center gap-2'>
        <span className='text-xl h-full'>
          <Link to='/' className='h-full'>
            <img src='../../assets/logo.png' className='h-[100%]' />
          </Link>
        </span>
        {location.pathname.includes('/dashboard') &&
        (currentPage === 'Clubs' || currentPage === 'Events') ? (
          <div className='flex flex-row gap-2 flex-grow items-center justify-center'>
            <Input
              placeholder={`Search for ${currentPage}`}
              name='search'
              type='text'
              color='blue'
              label=''
              filled={false}
            />
            <Select
              label=''
              options={[
                `All ${currentPage}`,
                'Suggested',
                location.pathname.includes('/clubs')
                  ? 'Subscribed'
                  : 'Hosted by Subscribed Clubs',
                ...(location.pathname.includes('/calendar')
                  ? ['Attending']
                  : [])
              ]}
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
        <div className='flex items-center justify-center'>
          {!location.pathname.includes('/login') &&
            !location.pathname.includes('/signup') &&
            !location.pathname.includes('/verifyEmail') && (
              <>
                {user ? (
                  <UserDropdown user={user as User} />
                ) : (
                  <div className='flex flex-row gap-2 text-nowrap'>
                    <Button
                      text='Log In'
                      color='white'
                      filled={false}
                      onClick={() => {
                        navigate('/login');
                      }}
                    />
                    <Button
                      text='Sign Up'
                      color='white'
                      filled={false}
                      onClick={() => {
                        navigate('signup');
                      }}
                    />
                  </div>
                )}
              </>
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
