import { useNavigate } from 'react-router';
import { IconContext } from 'react-icons';

interface SidebarButtonProps {
  text: string;
  icon: JSX.Element;
  route: string;
}

const SidebarButton = ({ text, icon, route }: SidebarButtonProps) => {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate(route)}
      className='flex justify-center items-center flex-col'
    >
      <IconContext.Provider value={{ className: 'w-8 h-8 text-blue-950' }}>
        {icon}
      </IconContext.Provider>
      <span className='text-blue-950'>{text}</span>
    </button>
  );
};

export default SidebarButton;
