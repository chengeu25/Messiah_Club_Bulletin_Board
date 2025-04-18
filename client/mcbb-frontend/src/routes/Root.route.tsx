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
  useSearchParams,
  useRevalidator
} from 'react-router-dom';
import Button from '../components/formElements/Button.component';
import { useEffect, useMemo, useState } from 'react';
import toTitleCase from '../helper/titleCase';
import UserDropdown from '../components/specialDropdowns/UserDropdown.component';
import { SchoolType, UserType as User, UserType } from '../types/databaseTypes';
import selectStyles from '../components/formElements/Select.styles';
import SearchAndFilter from '../components/dashboard/SearchAndFilter.component';
import setCSSVars from '../helper/setCSSVars';
import { useSchool } from '../contexts/SchoolContext';
import { DynamicLogo } from '../components/ui/DynamicLogo.component';
import { useNotification } from '../contexts/NotificationContext';
import Notifications from '../components/ui/Notifications';

/**
 * Root component for the application's main layout and navigation.
 *
 * @component Root
 * @description Provides the core application structure, including:
 * - Top navigation bar
 * - User dropdown or login button
 * - Dynamic search and filtering
 * - Responsive routing
 *
 * @returns {JSX.Element} Rendered application layout
 *
 * @workflow
 * 1. Render top navigation bar
 * 2. Manage user dropdown or login button based on authentication
 * 3. Handle dynamic search and filtering
 * 4. Render child routes using Outlet
 *
 * @features
 * - Centralized navigation
 * - Conditional rendering based on authentication
 * - Dynamic page title and search functionality
 * - Responsive design
 * - User authentication controls
 */
const Root = () => {
  // Hook for accessing loader data (user authentication)
  const { user, school, prefs } = useLoaderData() as {
    user: UserType;
    school: SchoolType;
    prefs: { value: string };
  };
  const revalidate = useRevalidator();
  const { currentSchool, setCurrentSchool } = useSchool();
  const navigate = useNavigate();
  const { notifications, deleteNotification } = useNotification();
  const location = useLocation();
  const [params, setParams] = useSearchParams();

  // State management for search and filtering
  const selectedFilter = useMemo(() => prefs?.value, [prefs]);
  const setSelectedFilter = async (filter: string) => {
    const page = location.pathname.split('/')[2];
    const resp = await fetch(
      `${import.meta.env.VITE_API_BASE_URL}/api/prefs/${page}`,
      {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ value: filter })
      }
    );
    if (resp.ok) {
      revalidate.revalidate();
    }
  };
  const [searchQuery, setSearchQuery] = useState('');

  /**
   * Derives the current page name from the location pathname.
   *
   * @function currentPage
   * @returns {string} Formatted page name
   * @description Converts pathname to a readable title, with specific replacements
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

  /**
   * Side effect to update URL search parameters based on search and filter
   *
   * @effect
   * @description Dynamically updates URL parameters for Events and Clubs pages
   */
  useEffect(() => {
    if (currentPage === 'Events' || currentPage === 'Clubs') {
      const newParams = new URLSearchParams(params.toString());
      newParams.set('search', searchQuery);
      newParams.set('filter', selectedFilter);
      setParams(newParams, { replace: true });
    }
  }, [searchQuery, selectedFilter, setParams, currentPage]);

  /**
   * Side effect to update colors based on whether or not you are on the homepage
   *
   * @effect
   * @description Changes background color based on whether or not you are on the homepage
   */
  useEffect(() => {
    if (location.pathname === '/') {
      setCSSVars('172554');
    } else {
      setCSSVars(school?.color ?? '');
    }
  }, [location.pathname, school?.color]);

  // Initialize school context from loader data
  useEffect(() => {
    if (school) {
      setCurrentSchool(school);
    }
  }, [school, setCurrentSchool]);

  return (
    <div className='h-[100dvh] flex flex-col relative bg-gray-100'>
      <Notifications
        notifications={notifications}
        deleteNotification={deleteNotification}
      />
      {/* Top Navigation Bar */}
      <nav
        className={`w-full h-20 sm:min-h-[10%] ${
          location.pathname === '/' ? 'bg-blue-950' : 'foreground-filled'
        } text-white p-3 shadow-md relative flex justify-between items-center gap-2`}
      >
        {/* Logo */}
        <span className='text-xl h-full'>
          <Link to='/' className='h-full'>
            <DynamicLogo />
          </Link>
        </span>

        {/* Conditional Search and Filter */}
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
              selectStyles={selectStyles(location.pathname !== '/')}
            />
          </div>
        ) : (
          <></>
        )}

        {/* Authentication Controls */}
        <div className='flex items-center justify-center'>
          {!location.pathname.includes('/login') &&
            !location.pathname.includes('/signup') &&
            !location.pathname.includes('/verifyEmail') && (
              <>
                {user ? (
                  <UserDropdown user={user as User} />
                ) : (
                  <div
                    className={`flex flex-row text-nowrap ${
                      location.pathname === '/'
                        ? 'bg-blue-950 gap-6 border-2 border-white rounded-xl'
                        : 'tag gap-2'
                    } rounded-xl p-2`}
                  >
                    <Button
                      text='Log In'
                      filled={location.pathname === '/'}
                      onClick={() => {
                        if (
                          currentSchool !== null &&
                          currentSchool !== undefined
                        ) {
                          navigate(`/login/${currentSchool.id}`);
                        } else {
                          navigate('/selectSchool?route=login');
                        }
                      }}
                    />
                    <Button
                      text='Sign Up'
                      filled={location.pathname === '/'}
                      onClick={() => {
                        if (
                          currentSchool !== null &&
                          currentSchool !== undefined
                        ) {
                          navigate(`/signup/${currentSchool.id}`);
                        } else {
                          navigate('/selectSchool?route=signup');
                        }
                      }}
                    />
                  </div>
                )}
              </>
            )}
        </div>
      </nav>

      {/* Main Content Area */}
      <div className='w-full h-full relative overflow-hidden'>
        <Outlet />
      </div>
    </div>
  );
};

export default Root;
