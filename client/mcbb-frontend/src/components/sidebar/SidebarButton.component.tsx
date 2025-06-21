import { useNavigate } from 'react-router';
import { IconContext } from 'react-icons';

/**
 * Defines the properties for the SidebarButton component
 *
 * @interface SidebarButtonProps
 * @property {string} text - The display text for the sidebar button
 * @property {JSX.Element} icon - The icon component to be displayed
 * @property {string} route - The navigation route when the button is clicked
 */
interface SidebarButtonProps {
  text: string;
  icon: JSX.Element;
  route: string;
}

/**
 * Renders a clickable sidebar navigation button with an icon and text
 *
 * @component
 * @param {SidebarButtonProps} props - The properties for the SidebarButton
 * @returns {JSX.Element} A styled button with an icon and text that navigates to a specified route
 *
 * @example
 * <SidebarButton
 *   text="Dashboard"
 *   icon={<FaHome />}
 *   route="/dashboard/home"
 * />
 *
 * @remarks
 * - Uses React Router's useNavigate hook for client-side navigation
 * - Applies consistent styling to icons using IconContext
 * - Centered layout with vertical icon and text arrangement
 */
const SidebarButton = ({ text, icon, route }: SidebarButtonProps) => {
  /**
   * Navigation hook from React Router for programmatic navigation
   * @type {Function}
   */
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate(route)}
      className='flex justify-center items-center flex-col'
    >
      <IconContext.Provider
        value={{
          className:
            'w-8 h-8 foreground-outlined flex items-center justify-center'
        }}
      >
        {icon}
      </IconContext.Provider>
      <span className='foreground-outlined'>{text}</span>
    </button>
  );
};

export default SidebarButton;
