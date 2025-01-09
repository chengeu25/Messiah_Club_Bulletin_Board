import { Outlet } from 'react-router-dom';
import Sidebar from '../../components/sidebar/Sidebar.component';

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
  return (
    <div className='w-full h-full flex flex-col sm:flex-row overflow-hidden'>
      {/* Desktop Sidebar */}
      <aside className='hidden sm:flex flex-col h-full border-r-1 border-gray-100 shadow-md gap-2 p-2'>
        <Sidebar />
      </aside>

      {/* Content flow */}
      <div className='flex-grow flex relative overflow-hidden h-full'>
        <Outlet />
      </div>

      {/* Mobile Sidebar */}
      <div className='border-t-2 border-gray-100 shadow-md flex sm:hidden w-full gap-2 p-2 justify-center sticky bottom-0 bg-white'>
        <Sidebar />
      </div>
    </div>
  );
};

export default Dashboard;
