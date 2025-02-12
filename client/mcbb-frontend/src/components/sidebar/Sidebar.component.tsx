import React, { useEffect, useState } from 'react';
import SidebarButton from './SidebarButton.component';
import {
  FaCalendar,
  FaUsers,
  FaUser,
  FaChalkboardTeacher,
  FaCheckCircle,
  FaBuilding
} from 'react-icons/fa';
import { RiCompassDiscoverFill } from 'react-icons/ri';
import checkUser from '../../helper/checkUser';
import { UserType as User } from '../../types/databaseTypes';

/**
 * Represents the structure of a sidebar button
 *
 * @interface SidebarButtonConfig
 * @property {string} text - The display text for the sidebar button
 * @property {React.ReactNode} icon - The icon component for the button
 * @property {string} route - The navigation route when the button is clicked
 */
interface SidebarButtonConfig {
  text: string;
  icon: React.ReactNode;
  route: string;
}

/**
 * Renders a dynamic sidebar with navigation buttons
 *
 * @component
 * @description Creates a sidebar that adapts its buttons based on user role
 * @returns {JSX.Element} A sidebar with dynamically generated navigation buttons
 *
 * @example
 * // Renders a sidebar with default buttons for students
 * <Sidebar />
 *
 * @remarks
 * - Dynamically adds a 'Faculty' button for faculty users
 * - Uses React hooks to manage button list and user role
 * - Integrates with checkUser helper to determine user type
 * - Renders SidebarButton components with icons and routes
 */
const Sidebar = () => {
  /**
   * State to manage the list of sidebar buttons
   * @type {SidebarButtonConfig[]}
   */
  const [buttonList, setButtonList] = useState<SidebarButtonConfig[]>([
    {
      text: 'Discover',
      icon: <RiCompassDiscoverFill />,
      route: '/dashboard/home'
    },
    { text: 'Calendar', icon: <FaCalendar />, route: '/dashboard/calendar' },
    { text: 'Clubs', icon: <FaUsers />, route: '/dashboard/clubs' }
  ]);

  /**
   * State to track whether the current user is a faculty member
   * @type {boolean}
   */
  const [isFaculty, setIsFaculty] = useState(false);

  /**
   * Fetch and check user data to determine faculty status
   * @effect
   * @async
   */
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const user = await checkUser();
        if ((user as User).isFaculty) {
          setIsFaculty(true);
        }
      } catch (error) {
        console.error('Error checking user:', error);
      }
    };

    fetchUserData();
  }, []);

  /**
   * Add faculty-specific button when user is confirmed as faculty
   * @effect
   */
  useEffect(() => {
    if (isFaculty) {
      setButtonList((prevList) => [
        ...prevList,
        {
          text: 'Faculty',
          icon: <FaChalkboardTeacher />,
          route: '/dashboard/assignFaculty'
        },
        { text: 'Users', icon: <FaUser />, route: '/dashboard/adminUserForm' },
        {
          text: 'Approvals',
          icon: <FaCheckCircle />,
          route: '/dashboard/facultyEventApproval'
        }, 
        {
          text: 'School',
          icon: <FaBuilding />,
          route: '/dashboard/schoolEdit'
        }
      ]);
    }
  }, [isFaculty]);

  return (
    <>
      {buttonList.map((button) => (
        <React.Fragment key={button.text}>
          <SidebarButton
            text={button.text}
            icon={button.icon as JSX.Element}
            route={button.route}
          />
          <hr />
        </React.Fragment>
      ))}
    </>
  );
};

export default Sidebar;
