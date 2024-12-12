import React, { useEffect, useState } from 'react';
import SidebarButton from './SidebarButton.component';
import { FaCalendar, FaUsers, FaChalkboardTeacher } from 'react-icons/fa';
import { RiCompassDiscoverFill } from 'react-icons/ri';
import checkUser from '../../helper/checkUser';
import { UserType as User } from '../../types/databaseTypes';

const Sidebar = () => {
  const [buttonList, setButtonList] = useState([
    {
      text: 'Discover',
      icon: <RiCompassDiscoverFill />,
      route: '/dashboard/home',
    },
    { text: 'Calendar', icon: <FaCalendar />, route: '/dashboard/calendar' },
    { text: 'Clubs', icon: <FaUsers />, route: '/dashboard/clubs' },
  ]);

  const [isFaculty, setIsFaculty] = useState(false);

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

  useEffect(() => {
    if (isFaculty) {
      setButtonList((prevList) => [
        ...prevList,
        {
          text: 'Faculty',
          icon: <FaChalkboardTeacher />,
          route: '/dashboard/assignFaculty',
        },
      ]);
    }
  }, [isFaculty]);

  return (
    <>
      {buttonList.map((button) => (
        <React.Fragment key={button.text}>
          <SidebarButton
            text={button.text}
            icon={button.icon}
            route={button.route}
          />
          <hr />
        </React.Fragment>
      ))}
    </>
  );
};

export default Sidebar;
