import { Outlet } from 'react-router-dom';
import Sidebar from '../../components/sidebar/Sidebar.component';
import { FaCalendar, FaUsers, FaChalkboardTeacher } from 'react-icons/fa';
import { RiCompassDiscoverFill } from 'react-icons/ri';
import { useEffect, useMemo, useState } from 'react';
import checkUser from '../../helper/checkUser';
import { UserType } from '../../types/databaseTypes';

/**
 * Dashboard layout component that provides a responsive sidebar and content area.
 *
 * @component
 * @description Renders a dashboard with:
 * - Desktop sidebar (hidden on small screens)
 * - Dynamic content area using React Router's Outlet
 * - Mobile bottom navbar (visible on small screens)
 *
 * @returns {React.ReactElement} Responsive dashboard layout with sidebar and content
 */
const Dashboard = () => {
  const [isFaculty, setIsFaculty] = useState(false);
  useEffect(() => {
    const fetchUserData = async () => {
      const user = await checkUser();
      if (!user) return;
      if ((user as UserType)?.isFaculty) {
        setIsFaculty(true);
      }
    };
    fetchUserData();
  });
  const buttonList = useMemo(
    () => [
      {
        text: 'Discover',
        icon: <RiCompassDiscoverFill />,
        route: '/dashboard/home'
      },
      { text: 'Calendar', icon: <FaCalendar />, route: '/dashboard/calendar' },
      { text: 'Clubs', icon: <FaUsers />, route: '/dashboard/clubs' },
      ...(isFaculty
        ? [
            {
              text: 'Faculty',
              icon: <FaChalkboardTeacher />,
              route: '/dashboard/faculty'
            }
          ]
        : [])
    ],
    [isFaculty]
  );
  return (
    <div className='w-full h-full flex flex-col sm:flex-row overflow-hidden'>
      {/* Desktop Sidebar */}
      <aside className='hidden sm:flex flex-col h-full border-r-1 border-gray-100 shadow-md gap-2 p-2'>
        <Sidebar buttonList={buttonList} />
      </aside>

      {/* Content flow */}
      <div className='flex-grow flex relative overflow-hidden h-full'>
        <Outlet />
      </div>

      {/* Mobile Sidebar */}
      <div className='border-t-2 border-gray-100 shadow-md flex sm:hidden w-full gap-2 p-2 items-center justify-center sticky bottom-0 bg-white'>
        <div className='flex w-full max-w-xs justify-between'>
          <Sidebar buttonList={buttonList} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
