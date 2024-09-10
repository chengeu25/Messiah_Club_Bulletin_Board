import SidebarButton from './SidebarButton.component';
import { FaCalendar, FaHome, FaUsers } from 'react-icons/fa';

const buttonList = [
  { text: 'Home', icon: <FaHome />, route: '/dashboard/home' },
  { text: 'Calendar', icon: <FaCalendar />, route: '/dashboard/calendar' },
  { text: 'Clubs', icon: <FaUsers />, route: '/dashboard/clubs' }
];

const Sidebar = () => (
  <>
    {buttonList.map((button) => (
      <>
        <SidebarButton
          key={button.text}
          text={button.text}
          icon={button.icon}
          route={button.route}
        />
        <hr />
      </>
    ))}
  </>
);

export default Sidebar;
