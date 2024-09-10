import { Outlet } from 'react-router-dom';
import Sidebar from '../../components/sidebar/Sidebar.component';

const Dashboard = () => {
  return (
    <div className='w-full h-full flex flex-col sm:flex-row'>
      {/* Desktop Sidebar */}
      <aside className='hidden sm:flex flex-col h-full border-r-1 border-gray-100 shadow-md gap-2 p-2'>
        <Sidebar />
      </aside>

      {/* Content flow */}
      <div className='flex-grow flex'>
        <Outlet />
      </div>

      {/* Mobile Sidebar */}
      <div className='border-t-2 border-gray-100 shadow-md flex sm:hidden w-full gap-2 p-2 justify-center'>
        <Sidebar />
      </div>
    </div>
  );
};

export default Dashboard;
