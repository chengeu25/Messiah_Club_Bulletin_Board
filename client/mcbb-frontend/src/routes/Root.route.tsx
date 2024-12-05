/**
 * The main route component for the application. This component
 * renders the top navigation bar and the main content of the page.
 */
import {
  Outlet,
  useLoaderData,
  useNavigate,
  Link,
  useLocation,
  useSearchParams
} from 'react-router-dom';
import Button from '../components/formElements/Button.component';
import { IoIosArrowBack, IoIosArrowForward } from 'react-icons/io';
import { BiHome } from 'react-icons/bi';
import {
  getMonthName,
  getMostRecentSunday,
  getNextSaturday
} from '../helper/dateUtils';
import { useEffect, useMemo, useState } from 'react';
import toTitleCase from '../helper/titleCase';
import UserDropdown from '../components/userDropdown/UserDropdown.component';
import { UserType as User } from '../types/databaseTypes';
import selectStyles from '../components/formElements/Select.styles';
import SearchAndFilter from '../components/dashboard/SearchAndFilter.component';
import logo from '../../assets/logo.png';

const Root = () => {
  const user = useLoaderData();
  const navigate = useNavigate();
  const location = useLocation();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_params, setParams] = useSearchParams();

  const [selectedFilter, setSelectedFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

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

  useEffect(() => {
    if (currentPage === 'Events' || currentPage === 'Clubs') {
      setParams(
        {
          search: searchQuery,
          filter: selectedFilter
        },
        { replace: true }
      );
    }
  }, [searchQuery, selectedFilter, setParams, currentPage]);

  useEffect(() => {
    setSelectedFilter(`All ${currentPage}`);
    setSearchQuery('');
  }, [currentPage]);

  return (
    <div className='w-screen h-screen flex flex-col relative bg-gray-100'>
      <nav className='w-full h-20 sm:min-h-[10%] bg-blue-950 text-white p-3 shadow-md relative flex justify-between items-center gap-2'>
        <span className='text-xl h-full'>
          <Link to='/' className='h-full'>
            <img src={logo} className='h-[100%]' />
          </Link>
        </span>
        {location.pathname.includes('/dashboard') &&
        (currentPage === 'Clubs' || currentPage === 'Events') ? (
          <div className='flex flex-row gap-2 flex-grow items-center justify-center'>
            <SearchAndFilter
              location={location}
              currentPage={currentPage}
              selectedFilter={selectedFilter}
              setSelectedFilter={setSelectedFilter}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              selectStyles={selectStyles}
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
