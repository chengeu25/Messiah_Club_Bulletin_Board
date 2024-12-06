import React from 'react';
import SidebarButton from './SidebarButton.component';
import { FaCalendar, FaUsers } from 'react-icons/fa';
import { RiCompassDiscoverFill } from 'react-icons/ri';

const buttonList = [
  {
    text: 'Discover',
    icon: <RiCompassDiscoverFill />,
    route: '/dashboard/home'
  },
  { text: 'Calendar', icon: <FaCalendar />, route: '/dashboard/calendar' },
  { text: 'Clubs', icon: <FaUsers />, route: '/dashboard/clubs' }
];

const Sidebar = () => (
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

export default Sidebar;
