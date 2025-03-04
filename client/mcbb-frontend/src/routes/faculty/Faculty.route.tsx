import {
  FaChalkboardTeacher,
  FaUser,
  FaCheckCircle,
  FaBuilding
} from 'react-icons/fa';
import Sidebar from '../../components/sidebar/Sidebar.component';
import { Outlet } from 'react-router';
import { IoIosDocument } from 'react-icons/io';

const Faculty = () => {
  const buttonList = [
    {
      text: 'Faculty',
      icon: <FaChalkboardTeacher />,
      route: '/dashboard/faculty/assignFaculty'
    },
    {
      text: 'Users',
      icon: <FaUser />,
      route: '/dashboard/faculty/adminUserForm'
    },
    {
      text: 'Approvals',
      icon: <FaCheckCircle />,
      route: '/dashboard/faculty/facultyEventApproval'
    },
    {
      text: 'School',
      icon: <FaBuilding />,
      route: '/dashboard/faculty/schoolEdit'
    },
    {
      text: 'Reports',
      icon: <IoIosDocument />,
      route: '/dashboard/faculty/reports'
    }
  ];

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
      <div className='border-t-2 border-gray-100 shadow-md flex sm:hidden w-full gap-2 p-2 justify-center bg-white'>
        <Sidebar buttonList={buttonList} />
      </div>
    </div>
  );
};

export default Faculty;
