import { Outlet } from 'react-router-dom';

const Root = () => {
  return (
    <div className='w-screen h-screen flex flex-col relative'>
      <nav className='w-full bg-blue-950 text-white p-3 fomt-xl shadow-md relative'>
        Messiah University Engagement Bulletin
      </nav>
      <div className='w-full h-full relative overflow-y-scroll'>
        <Outlet />
      </div>
    </div>
  );
};

export default Root;
